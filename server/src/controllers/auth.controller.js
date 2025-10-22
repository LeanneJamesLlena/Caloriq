


export const testGetAuthRoute = async (req, res) => {
    try {
        res.status(200).json({message: "auth route working :)"});
    } catch (error) {
        res.status(500).json({message: error.message});
        console.log(error.message);
    }
}