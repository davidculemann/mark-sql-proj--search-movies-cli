import { question, promptLoop, prompt, keyInSelect } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
require("dotenv").config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function searchMovies() {

    await client.connect();
    while (true) {
        const options = ['Search', 'See favourites', 'Clear favourites', 'Quit']
        const index = keyInSelect(options)
        const columns = ['id', 'name', 'date', 'runtime budget', 'revenue', 'vote_average', 'votes_count']

        if (index === 0) {
            let searchTerm = prompt()
            const text = `SELECT ${columns.join(', ')} FROM movies where LOWER(name) LIKE ($1) AND kind = ($2) ORDER BY date desc LIMIT 10`

            const search = [`%${searchTerm.toLowerCase()}%`, 'movie']
            const res = await client.query(text, search);
            console.table(res.rows);

            //display favourites options
            const favouriteOptions = res.rows.map(el => el.name)
            const indexFavourite = keyInSelect(favouriteOptions)
            const faves = [parseInt(res.rows[indexFavourite].id)]
            const resFavourite = await client.query("INSERT INTO favourites (movie_id) VALUES ($1)", faves);
        }
        else if (index === 1) {
            const text = `SELECT ${columns.join(', ')} FROM movies WHERE id IN(SELECT movie_id from favourites)`
            const res = await client.query(text);
            console.table(res.rows);
        }
        else if (index === 2) {
            const text = `DELETE FROM favourites *`
            const res = await client.query(text);
        }

        else if (index === 3) {
            break;
        }
    }
    await client.end();
    console.log('User exited loop')
}

console.log("Welcome to search-movies-cli!\nchoose an option:");
searchMovies()