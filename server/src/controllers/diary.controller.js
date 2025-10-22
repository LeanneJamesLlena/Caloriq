


export const testGetDiaryRoute = async (req, res) => {
    try {
        res.status(200).json({message: "diary route working :)"});
    } catch (error) {
        res.status(500).json({message: error.message});
        console.log(error.message);
    }
}