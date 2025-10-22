

export const testGetFoodRoute = async (req, res) => {
    try {
        res.status(200).json({message: "food route working :)"});
    } catch (error) {
        res.status(500).json({message: error.message});
        console.log(error.message);
    }
}