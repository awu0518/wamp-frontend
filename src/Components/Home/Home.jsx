function Home() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <h1>Welcome to GeoJournal</h1>
      <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '2rem' }}>
        Track the places you've visited and create your personal geographical journal.
      </p>
      
      <div>
        <h2>Key Features</h2>
        <ul style={{ lineHeight: '1.8', fontSize: '1rem' }}>
          <li>Mark locations on an interactive map</li>
          <li>Write journal entries about your experiences</li>
          <li>View your complete travel history</li>
          <li>See leaderboards of most visited places</li>
        </ul>
      </div>
    </div>
  )
}

export default Home
