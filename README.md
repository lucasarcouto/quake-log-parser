# Quake 3 Arena Log Parser

This project is intended to create a utility tool for parsing log files from a Quake 3 Arena server. Users will be able to upload log files and, after the information is parsed, they can select which type of kill summary to view.

## Running this project

After downloading the source code and making sure you have the environment set up correctly (Node.js 16.8 or later is required), just run the following commands in a terminal while inside of the project folder to start it:

```bash
npm install
```

```bash
npm run dev
```

This will run the project in development mode and you can view it by openning [http://localhost:3000](http://localhost:3000) in your browser.

## Examples of summaries

### Standard
`{
  "game_1": {
    "total_kills": 11,
    "players": [
      "Isgalamido",
      "Mocinha"
    ],
    "kills": {
      "Isgalamido": -9
    }
  }
}`

### By kill method
`{
  "game-1": {
    "kills_by_means": {
      "MOD_TRIGGER_HURT": 7,
      "MOD_ROCKET_SPLASH": 3,
      "MOD_FALLING": 1
    }
  }
}`

## License

This project is licensed under [MIT License](./LICENSE).