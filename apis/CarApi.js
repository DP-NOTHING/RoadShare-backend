const axios = require("axios");

module.exports = {
  // APIs
  apis: function (app, admin) {
    /**
     * Endpoint for getting a list of available trims of a make,model, and year
     */
     app.post("/api/findCar", async (req, res, next) => {
      if (req && req.body) {
        console.log(req.body);
        // Get year,make, and model from the request
        let make = req.body["make"];
        let year = req.body["year"];
        let model = req.body["model"];
        console.log(req.body);

        try {
          // Get the trim data for the requested car
          console.log(`https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`)
          const resp = await axios.get(
            `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`,
            {
              headers: {
                accept: "application/json",
              },
            }
          );
          console.log(resp.data);
          // ensure that the request was successful
          if (resp && resp.data) {
            let vehicle_data = resp.data;
            let id;
            // Check if menuItem is an array
            if (Array.isArray(vehicle_data.menuItem)) {
              // Assuming you want the first item's value
              id = vehicle_data.menuItem[0]["value"];
            } else if (typeof vehicle_data.menuItem === 'object') {
              // If menuItem is an object, directly extract value
              id = vehicle_data.menuItem["value"];
            } else {
              // Handle other cases where menuItem is not as expected
              throw new Error("Invalid menuItem format in response");
            }
            res.status(200).json({
              make: make,
              year: year,
              model: model,
              id: id,
            });
          } else {
            res.status(400).json({ error: "Bad Response From Fueleconomy Api" });
          }
        } catch (error) {
          res.status(404).json({ error: "Error from fueleconomy api" });
        }
      } else {
        res.status(404).json({ error: "No Request Body specified" });
      }
    });


    /**
     * Endpoint for getting info about a certain car given an id
     */
    // app.post("/api/addCar", async (req, res, next) => {
    //   // Get the car id for the request
    //   console.log(req.body);
    //   if (req && req.body) {
    //     let id = req.body["id"];
    //     let make = req.body["make"];
    //     let year = req.body["year"];
    //     let model = req.body["model"];
    //     let email = req.body["email"];

    //     try {
    //       const resp = await axios.get(
    //         `https://www.fueleconomy.gov/ws/rest/ympg/shared/ympgVehicle/${id}`,
    //         {
    //           headers: {
    //             accept: "application/json",
    //           },
    //         }
    //       );
    //       console.log(resp);

    //       // Ensure that respose was retrieved
    //       if (resp && resp.data) {
    //         await admin
    //           .firestore()
    //           .collection("users")
    //           .doc(`${email}`)
    //           .set({
    //             car_data: {
    //               id: id,
    //               make: make,
    //               year: year,
    //               model: model,
    //               mpg: resp.data["avgMpg"],
    //             },
    //           });

    //         res.status(200).json({ info: "Car info updated" });
    //       } else {
    //         res
    //           .status(400)
    //           .json({ error: "Bad response from FuelEconomy Api" });
    //       }
    //     } catch (error) {
    //       res.status(404).json({ error: "Error from fueleconomy api" });
    //     }
    //   } else {
    //     res.status(204).json({ error: "No Request Body specified" });
    //   }
    // });

    app.post("/api/addCar", async (req, res, next) => {
      // Get the car id for the request
      console.log(req.body);
      if (req && req.body) {
        let id = req.body["id"];
        let make = req.body["make"];
        let year = req.body["year"];
        let model = req.body["model"];
        let email = req.body["email"];
    
        try {
          const resp = await axios.get(
            `https://www.fueleconomy.gov/ws/rest/ympg/shared/ympgVehicle/${id}`,
            {
              headers: {
                accept: "application/json",
              },
            }
          );
          console.log(resp);
    
          // Ensure that response was retrieved
          if (resp && resp.data) {
            // Construct the car_data object
            const carData = {
              id: id,
              make: make,
              year: year,
              model: model,
              mpg: resp.data["avgMpg"],
            };
    
            // Update only the car_data field of the user document
            await admin
              .firestore()
              .collection("users")
              .doc(email)
              .update({ car_data: carData });
    
            res.status(200).json({ info: "Car info updated" });
          } else {
            res.status(400).json({ error: "Bad response from FuelEconomy Api" });
          }
        } catch (error) {
          res.status(404).json({ error: "Error from fueleconomy api" });
        }
      } else {
        res.status(204).json({ error: "No Request Body specified" });
      }
    });
    
  },
};
