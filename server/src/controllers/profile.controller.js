




export const testGetProfileRoute = async (req, res) => {
    try {
        res.status(200).json({message: "profile route working :)"});
    } catch (error) {
        res.status(500).json({message: error.message});
        console.log(error.message);
    }
}