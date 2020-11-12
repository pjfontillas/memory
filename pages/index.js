import Head from 'next/head'
import styles from '../styles/Home.module.css'
import '../node_modules/animate.css/animate.min.css'
import Memory from '../js/memory.js'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Memory</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Memory pairs={12} />
    </div>
  )
}
