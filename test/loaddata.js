const indexingService = require("../common/indexingService.ts");


const titles = ["Avengers: Endgame", "Titanic", "Star Wars: Episode VII - The Force Awakens", "Avatar: The Way of Water", "Avengers: Infinity War", "Spider-Man: No Way Home", "Jurassic World", "The Lion King", "The Avengers", "Furious 7", "Top Gun: Maverick", "Frozen II", "Avengers: Age of Ultron", "Black Panther", "Harry Potter and the Deathly Hallows: Part 2", "Star Wars: Episode VIII - The Last Jedi", "Jurassic World: Fallen Kingdom", "Frozen", "Beauty and the Beast", "Incredibles 2", "The Fate of the Furious", "Iron Man 3", "Minions", "Captain America: Civil War", "Aquaman",
    "The Lord of the Rings: The Return of the King", "Spider-Man: Far from Home", "Captain Marvel", "Transformers: Dark of the Moon", "Jurassic Park", "Skyfall", "Transformers: Age of Extinction", "The Dark Knight Rises", "Star Wars: Episode IX - The Rise of Skywalker", "Joker", "Toy Story 4", "Toy Story 3", "Pirates of the Caribbean: Dead Man's Chest",
    "Rogue One: A Star Wars Story", "Aladdin", "Pirates of the Caribbean: On Stranger Tides", "Despicable Me 3", "Finding Dory", "Star Wars: Episode I - The Phantom Menace", "Zootopia", "Alice in Wonderland", "Harry Potter and the Sorcerer's Stone", "The Hobbit: An Unexpected Journey", "The Dark Knight", "Jurassic World: Dominion", "Jumanji: Welcome to the Jungle", "Harry Potter and the Deathly Hallows: Part 1", "Despicable Me 2", "The Lion King", "The Jungle Book", "The Hobbit: The Battle of the Five Armies", "Pirates of the Caribbean: At World's End", "The Hobbit: The Desolation of Smaug", "Doctor Strange in the Multiverse of Madness", "The Lord of the Rings: The Two Towers", "Harry Potter and the Order of the Phoenix", "Finding Nemo", "Minions: The Rise of Gru", "Harry Potter and the Half-Blood Prince", "Shrek 2", "Harry Potter and the Chamber of Secrets", "Bohemian Rhapsody", "The Battle at Lake Changjin", "The Lord of the Rings: The Fellowship of the Ring", "Harry Potter and the Goblet of Fire", "Spider-Man 3", "The Secret Life of Pets", "Ice Age: Dawn of the Dinosaurs", "Spectre", "Spider-Man: Homecoming", "Ice Age: Continental Drift", "Batman v Superman: Dawn of Justice", "Wolf Warrior 2", "Star Wars: Episode III - Revenge of the Sith", "The Hunger Games: Catching Fire", "Guardians of the Galaxy Vol. 2", "Inside Out", "Venom", "Thor: Ragnarok", "The Twilight Saga: Breaking Dawn - Part 2", "Black Panther: Wakanda Forever", "Inception", "Transformers: Revenge of the Fallen", "Spider-Man", "Wonder Woman", "Hi, Mom", "Independence Day", "Coco", "Fantastic Beasts and Where to Find Them", "Shrek the Third", "Jumanji: The Next Level", "Harry Potter and the Prisoner of Azkaban", "Pirates of the Caribbean: Dead Men Tell No Tales", "E.T. the Extra-Terrestrial", "Mission: Impossible - Fallout", "2012", "Indiana Jones and the Kingdom of the Crystal Skull", "Spider-Man 2", "Fast & Furious 6", "Deadpool 2", "Deadpool", "Star Wars: Episode IV - A New Hope", "No Time to Die", "Interstellar", "Guardians of the Galaxy", "The Batman", "Thor: Love and Thunder", "Fast & Furious Presents: Hobbs & Shaw", "The Da Vinci Code", "Maleficent", "The Amazing Spider-Man", "The Hunger Games: Mockingjay - Part 1", "Shrek Forever After", "Gravity", "Madagascar 3: Europe's Most Wanted", "Suicide Squad", "X-Men: Days of Future Past", "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe", "Monsters University", "The Matrix Reloaded", "Up", "Ne Zha", "F9: The Fast Saga", "Captain America: The Winter Soldier",
    "The Twilight Saga: Breaking Dawn - Part 1", "The Twilight Saga: New Moon", "Dawn of the Planet of the Apes", "Transformers", "The Amazing Spider-Man 2", "It", "The Wandering Earth", "The Twilight Saga: Eclipse", "Mission: Impossible - Ghost Protocol", "Mamma Mia!", "The Hunger Games", "Detective Chinatown 3", "Mission: Impossible - Rogue Nation", "Forrest Gump", "Doctor Strange", "The Sixth Sense", "Man of Steel", "Ice Age: The Meltdown", "Kung Fu Panda 2", "Moana", "Justice League", "Big Hero 6", "Fantastic Beasts: The Crimes of Grindelwald", "Pirates of the Caribbean: The Curse of the Black Pearl", "Men in Black 3", "Star Wars: Episode II - Attack of the Clones", "The Hunger Games: Mockingjay - Part 2", "Thor: The Dark World", "Sing", "Kung Fu Panda", "The Incredibles", "The Martian", "Hancock", "Water Gate Bridge", "Fast Five", "Iron Man 2", "Ratatouille", "Ant-Man and the Wasp", "How to Train Your Dragon 2", "Logan", "The Lost World: Jurassic Park", "Casino Royale", "The Passion of the Christ", "Life of Pi", "Transformers: The Last Knight", "Madagascar: Escape 2 Africa", "War of the Worlds", "Tangled", "Ready Player One", "Quantum of Solace", "Men in Black", "The Croods", "The Hangover Part II", "Iron Man", "I Am Legend", "Monsters, Inc.", "Operation Red Sea", "Night at the Museum", "Fifty Shades of Grey", "Kong: Skull Island", "The Smurfs", "Cars 2", "King Kong", "Puss in Boots", "The Mermaid", "Armageddon", "The Day After Tomorrow", "Ted", "American Sniper", "Mission: Impossible II"];

const loadData = function () {

    let icount = 0;
    titles.forEach(title => {

        icount++;
        let idxDate = new Date() ; 

        let rnd = Math.floor(Math.random() * (12 - 0 + 1)) + 0
        idxDate.setMonth(idxDate.getMonth() - rnd);
        idxDate.setDate(Math.floor(Math.random() * (28 - 1 + 1)) + 1 )


        console.log(idxDate) ;
        let item = {
            "title": title,
            "fileName": title + ".mp4",
            "uid": icount + "",
            "id": icount + "",
            "_id": icount + "",
            "fileSize": Math.floor(Math.random() * (700000000 - 100000000 + 1)) + 10000000,
            "chunks": [],
            "hash": (Math.floor(Math.random() * (1000000 - 500000 + 1)) + 500000) + "",
            "categories": ["movie"],
            "indexDate": idxDate.getTime() ,
            "description": title + " is a fantastic movie ranked #" + icount + " in the box office of all times !",
            "nbDownloads": 0
        }

        indexingService.add(item);
    });

}

loadData();
