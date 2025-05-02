import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeOpenAIRequest = async (messages, retries = 0) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.warn(
        `OpenAI request failed, retrying (${retries + 1}/${MAX_RETRIES})...`
      );
      await sleep(RETRY_DELAY * (retries + 1));
      return makeOpenAIRequest(messages, retries + 1);
    }
    throw error;
  }
};

export const generateDescriptionAlbum = async (name, artist) => {
  try {
    const result = await makeOpenAIRequest([
      {
        role: "system",
        content:
          "You are a music expert specializing in vinyl records and albums.",
      },
      {
        role: "user",
        content: `Analyze the record "${name}" by "${artist}" and provide the following information in JSON format:
        {
          "genre": "string (primary genre of the album)",
          "mood": "string (primary mood of the album)",
          "year": "number (release year)",
          "description": "string (brief album description, 2-3 sentences)"
        }
        
        Rules:
        - If you cannot determine a field, use null
        - Genre and mood should be single words or short phrases
        - Year should be a number between 1900 and current year
        - Description should be informative but concise
        - Ensure the response is valid JSON`,
      },
    ]);

    // Validate and sanitize the response
    return {
      genre: typeof result.genre === "string" ? result.genre.trim() : null,
      mood: typeof result.mood === "string" ? result.mood.trim() : null,
      year:
        typeof result.year === "number" &&
        result.year >= 1900 &&
        result.year <= new Date().getFullYear()
          ? result.year
          : null,
      description:
        typeof result.description === "string"
          ? result.description.trim()
          : null,
    };
  } catch (error) {
    console.error("Error in generateDescriptionAlbum:", error);
    throw new Error("Failed to generate album description");
  }
};

export const generateDescriptionCollection = async (
  records,
  existingGenres = [],
  existingMoods = []
) => {
  try {
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("Records array is required and must not be empty");
    }

    const recordList = records
      .map(
        (record) =>
          `- ${record.name} by ${record.artist} (${
            record.genre || "unknown genre"
          }, ${record.mood || "unknown mood"})`
      )
      .join("\n");

    const result = await makeOpenAIRequest([
      {
        role: "system",
        content:
          "You are a music expert specializing in vinyl record collections.",
      },
      {
        role: "user",
        content: `Analyze the following records and provide a collection description and top genres/moods in JSON format:
        
        Records:
        ${recordList}
        
        Existing genres: ${existingGenres.join(", ") || "none"}
        Existing moods: ${existingMoods.join(", ") || "none"}
        
        Return the following JSON format:
        {
          "description": "string (comprehensive collection description, 3-4 sentences)",
          "genres": ["string", "string", "string"] (top 3 genres),
          "moods": ["string", "string", "string"] (top 3 moods),
        }
        
        Rules:
        - Consider both existing and new records when determining top 3
        - Genres and moods should be single words or short phrases
        - If fewer than 3 items exist, use null for remaining slots
        - Description should highlight the collection's theme and diversity
        - Ensure the response is valid JSON`,
      },
    ]);

    // Validate and sanitize the response
    return {
      description:
        typeof result.description === "string"
          ? result.description.trim()
          : null,
      genres: Array.isArray(result.genres)
        ? result.genres
            .slice(0, 3)
            .map((g) => (typeof g === "string" ? g.trim() : null))
        : [null, null, null],
      moods: Array.isArray(result.moods)
        ? result.moods
            .slice(0, 3)
            .map((m) => (typeof m === "string" ? m.trim() : null))
        : [null, null, null],
    };
  } catch (error) {
    console.error("Error in generateDescriptionCollection:", error);
    throw new Error("Failed to generate collection description");
  }
};
