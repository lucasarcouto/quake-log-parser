import { useFilePicker } from 'use-file-picker'
import { QuakeLogo, Tab, TabBarItem } from '@components'
import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'
import { parseLog } from '@util/log_parser/log_parser'
import { Log, LogSummaryType } from '@util/log_parser/types'

/**
 * Root page for the application. This will render all components
 * required to parse a Quake 3 Arena log file.
 *
 * Users will be able to select a file from their file storage system
 * and, after parse, they'll be able select which type of summary they
 * want to view.
 */
export default function HomePage() {
  // State to store the log after it is parsed
  const [log, setLog] = useState<Log>()

  // State to store the currently selected type of summary
  const [logFilter, setLogFilter] = useState<LogSummaryType>('standard')

  const [openFileSelector, { filesContent, loading }] = useFilePicker({
    accept: '.txt',
    multiple: false
  })

  // Whenever the user selects a new file, this hook will be triggered
  // to parse it
  useEffect(() => {
    // Checking if the user selected a file
    if (filesContent.length > 0) {
      setLog(parseLog(filesContent[0].content))
    }
  }, [filesContent])

  const handleTabBarItemClick = useCallback((value: string) => {
    setLogFilter(value as LogSummaryType)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="home-page">
      <Head>
        <title>Quake Log Parser</title>
      </Head>
      <QuakeLogo />
      <button className="btn-default" onClick={() => openFileSelector()}>
        Select file
      </button>
      <br />
      {filesContent.map((file, index) => (
        <div key={index} className="log">
          <h2>File name: {file.name}</h2>
          <br />
          <p>Type of summary:</p>
          <br />
          <Tab>
            <TabBarItem
              label="Standard"
              value="standard"
              groupValue={logFilter}
              onClick={handleTabBarItemClick}
            />
            <TabBarItem
              label="By kill method"
              value="by_kill_method"
              groupValue={logFilter}
              onClick={handleTabBarItemClick}
            />
          </Tab>
          <br />
          <LogRenderer log={log} logFilter={logFilter} />
          <br />
        </div>
      ))}
    </div>
  )
}

type PropsRenderer = {
  log?: Log
  logFilter: LogSummaryType
}

/**
 * This function component is responsible to render a `Log`'s content.
 * If there's no log content, a message will be rendered letting the
 * user know about it.
 */
function LogRenderer({ log, logFilter }: PropsRenderer) {
  // Checking if there's any logs to render
  if (!log?.standard && !log?.byKillMethod) {
    return (
      <div className="empty-log">
        <p>Log is empty or there were no kills in the game</p>
      </div>
    )
  }
  return (
    <div>
      <pre>
        {logFilter == 'standard'
          ? log?.standard?.join('\n')
          : log?.byKillMethod?.join('\n')}
      </pre>
    </div>
  )
}
