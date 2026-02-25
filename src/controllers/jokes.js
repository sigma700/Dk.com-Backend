//here we design the relevant enpoint for fetching the dad jokes as reward for each five quisetions answered correct
import "dotenv/config";
export const fetchJokes = async (req, res) => {
  try {
    //remember to always set the headers ha ha ha
    const response = await fetch(process.env.JOKES_ENDP, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response) {
      return console.error(
        "It appears that the api is not working as required!",
      );
    }
    const jokeData = await response.json();
    res.status(response.status).json({
      success: true,
      message: "Random Joke was fetched successfully good work",
      data: jokeData,
    });
  } catch (error) {
    console.error(error);
    //creation of the error response
    res.status(500).json({
      success: false,
      message: "Pleae check the console for details on the error!",
      data: null,
    });
  }
};
