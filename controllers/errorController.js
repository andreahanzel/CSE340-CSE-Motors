const errorController = {};

errorController.trigger500Error = async (req, res, next) => {
    try {
        console.log("Trigger 500 Error route hit");
        let error = new Error("Intentional 500 Error");
        error.status = 500;
        throw error; // Intentionally throw the error
    } catch (err) {
        next(err); // Pass the error to the middleware
    }
};

module.exports = errorController;
