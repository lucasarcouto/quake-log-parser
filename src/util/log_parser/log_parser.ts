import { Log, Game, KillMethod } from './types'

/**
 * Main method to parse a log file from a Quake 3 Arena server.
 *
 * @return a `Log` variable containing all the kills that occurred
 * during each game.
 * Each resulting item from all lists will contain a JSON
 * with indentation, white spaces and line breaks to make
 * printing it easier. In HTML, just using this inside of a
 * `<pre>` tag will render it in a structured way.
 */
export function parseLog(content: string): Log {
  // If there's nothing to parse, then we just return an empty result
  if (content.length == 0) return {}

  // This regex will match all kill logs. In this particular
  // type of log, it uses the following pattern:
  // [any number of digits]:[2 digits] Kill: [any string]
  const regexPattern = /\d+:\d{2} Kill: .*/

  // Splitting the content using \n to separate into lines
  const splitContent = content.split('\n')

  let games: Game[] = []

  splitContent.forEach((item) => {
    // If the log contains the string below, it means a new game started,
    // so we add an empty game to our resulting array
    if (item.includes('0:00 -')) {
      addEmptyGame(games)
    }

    // Testing the current line to check if it is a kill log
    if (regexPattern.test(item)) {
      // If we get to this point, but we did not identify the start of
      // a new game, we're pushing a new empty game just to make sure
      // the rest of the code runs without issues
      if (games.length == 0) {
        addEmptyGame(games)
      }

      // Breaking the kill log just the make parsing each player
      // name a little easier.
      //
      // Here's an example of how a kill log looks like:
      // 2:22 Kill: 3 2 10: Isgalamido killed Dono da Bola by MOD_RAILGUN
      const parsedItem = item.split(' killed ')

      const indexPlayer1 = parsedItem[0].split(':', 3).join(':').length + 2
      const player1 = parsedItem[0].substring(
        indexPlayer1,
        parsedItem[0].length
      )
      updatePlayers(games, player1)

      const player2 = parsedItem[1].substring(
        0,
        parsedItem[1].lastIndexOf(' by')
      )
      updatePlayers(games, player2)

      const killMethod = item.substring(
        item.lastIndexOf(' ') + 1,
        item.length
      ) as KillMethod

      // If the current kill came from <world> or the player killed themselves
      // (by a grenade or some other method), this means we should subtract
      // a point from their kill score.
      if (player1 == '<world>' || player1 == player2) {
        updateKills(games, player2, true)
      } else {
        // If we get to this point, this means player1 killed another player,
        // so we should add 1 point to their kill score.
        updateKills(games, player1, false)
      }

      // Updating the total amount of kills
      games[games.length - 1] = {
        ...games[games.length - 1],
        totalKills: games[games.length - 1].totalKills + 1
      }

      updateKillsByMethod(games, killMethod)
    }
  })

  return buildLogSummary(games)
}

/**
 * Adds a new empty game to the `games` array.
 */
function addEmptyGame(games: Game[]) {
  games.push({
    id: games.length + 1,
    totalKills: 0,
    players: [],
    kills: [],
    killsByMethod: []
  })
}

/**
 * Updates the `players` list. In case the `playerName` is already
 * present in the list, the array remains unchanged.
 */
function updatePlayers(games: Game[], playerName: string) {
  // If the player is <world>, we just ignore it
  if (playerName == '<world>') return

  const playerIndex = games[games.length - 1].players.findIndex(
    (value) => value == playerName
  )

  if (playerIndex == -1) {
    games[games.length - 1].players.push(playerName)
  }
}

/**
 * Updates the `kills` list to account for a new kill.
 *
 * @param subtract represents whether the kill we're adding was
 * from `<world>` or if the player killed themselves.
 */
function updateKills(games: Game[], playerName: string, subtract: boolean) {
  const killsIndex = games[games.length - 1].kills.findIndex(
    (value) => value.player == playerName
  )

  const kills = games[games.length - 1].kills

  if (killsIndex == -1) {
    kills.push({ player: playerName, total: subtract ? -1 : 1 })
  } else {
    kills[killsIndex] = {
      ...kills[killsIndex],
      total: subtract
        ? kills[killsIndex].total - 1
        : kills[killsIndex].total + 1
    }
  }

  games[games.length - 1] = {
    ...games[games.length - 1],
    kills: kills
  }
}

/**
 * Updates the `killsByMethod` list to account for a new kill from
 * a `KillMethod`.
 *
 * If the `KillMethod` was previously added, its total is incremented
 * by 1. If not, it is added with total starting at 1.
 */
function updateKillsByMethod(games: Game[], killMethod: KillMethod) {
  const index = games[games.length - 1].killsByMethod.findIndex(
    (value) => value.method == killMethod
  )

  const killsByMethod = games[games.length - 1].killsByMethod

  if (index == -1) {
    killsByMethod.push({ method: killMethod, total: 1 })
  } else {
    killsByMethod[index] = {
      ...killsByMethod[index],
      total: killsByMethod[index].total + 1
    }
  }

  games[games.length - 1] = {
    ...games[games.length - 1],
    killsByMethod: killsByMethod
  }
}

/**
 * This function builds the resulting `Log` response for
 * `parseLog`.
 */
function buildLogSummary(games: Game[]): Log {
  let summaries: string[] = []
  let killsByMethod: string[] = []

  games.forEach((game) => {
    summaries.push(
      JSON.stringify(
        {
          [`game_${game.id}`]: {
            total_kills: game.totalKills,
            players: game.players,
            kills: game.kills.reduce((acc, kill) => {
              acc = { ...acc, [kill.player]: kill.total }
              return acc
            }, {})
          }
        },
        null,
        2
      )
    )

    killsByMethod.push(
      JSON.stringify(
        {
          [`game-${game.id}`]: {
            kills_by_means: game.killsByMethod.reduce((acc, killByMethod) => {
              acc = { ...acc, [killByMethod.method]: killByMethod.total }
              return acc
            }, {})
          }
        },
        null,
        2
      )
    )
  })

  return { standard: summaries, byKillMethod: killsByMethod }
}
