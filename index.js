import axios from "axios";
import express from "express";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index", {
        word: undefined,
        phonetic: undefined,
        meanings: [],
        pronunciation: undefined
    });
});

app.post("/submit", async (req, res) => {
    const vocab = req.body.vocabulary;

    try {
        const result = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${vocab}`);
        const wordData = result.data[0];

        const word = wordData.word;
        const phonetic = wordData.phonetics.length > 0 ? wordData.phonetics[0].text : "Not available";
        const meanings = wordData.meanings.map(meaning => meaning.definitions[0].definition);

        // Check if pronunciation data is available
        const pronunciation = wordData.phonetics.length > 0 ? wordData.phonetics[0].audio : undefined;

        res.render("index", {
            word: word,
            phonetic: phonetic,
            meanings: meanings,
            pronunciation: pronunciation
        });
    } catch (error) {
        // Handle errors here (e.g., if the word is not found in the API)
        res.render("index", {
            word: undefined,
            phonetic: undefined,
            meanings: [],
            pronunciation: undefined
        });
    }
});



//translation







async function translateText(text, targetLanguage) {
    const options = {
        method: 'POST',
        url: 'https://opentranslator.p.rapidapi.com/translate',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': 'e0cd0a3cf6mshc7a9cf1735dc1d0p1d82ebjsn1c51a8d894fa',
            'X-RapidAPI-Host': 'opentranslator.p.rapidapi.com'
        },
        data: {
            text: text,
            target: targetLanguage
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Define a route for the translation page
app.get('/translate', (req, res) => {
    res.render('translation', { translatedText: null });
});

// Handle translation form submission
app.post('/translate', async (req, res) => {
    const textToTranslate = req.body.textToTranslate;
    const targetLanguage = req.body.targetLanguage;

    try {
        const translation = await translateText(textToTranslate, targetLanguage);
        res.render('translation', { translatedText: translation.text });
    } catch (error) {
        console.error(error);
        res.render('translation', { translatedText: 'Translation error' });
    }
});

app.get("/aboutus",(req,res)=>{
    res.render("About.ejs")
})



app.get("/Practice",(req,res)=>{
    res.render("Practice.ejs")
})

app.get("/word-of-the-day",(req,res)=>{
    res.render("Word.ejs")
})



app.listen(port, () => {
    console.log(`Hey, it's working on port ${port}`);
});
