import { Link } from 'react-router-dom'

const features = [
  {
    icon: '🗺️',
    title: 'Interactive Map',
    description: 'Mark the places you\'ve been on a beautiful, interactive world map.',
  },
  {
    icon: '📝',
    title: 'Journal Entries',
    description: 'Write about your experiences and memories from every destination.',
  },
  {
    icon: '🧭',
    title: 'Travel History',
    description: 'See your complete journey at a glance — everywhere you\'ve explored.',
  },
  {
    icon: '🏆',
    title: 'Leaderboards',
    description: 'See how your travels stack up with leaderboards of the most visited places.',
  },
]

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-forest-50 to-sand-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-forest-800 mb-3">
            Welcome to GeoJournal
          </h1>
          <p className="text-lg md:text-xl text-earth-600/80 max-w-2xl mx-auto mb-5 font-body">
            Track the places you've visited, write about your adventures, and build your personal geographical journal.
          </p>
          <Link
            to="/map"
            className="inline-block bg-forest-600 hover:bg-forest-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 text-base"
          >
            Explore the Map
          </Link>
        </div>

        {/* SVG Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full leading-none">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-[40px] md:h-[60px]">
            <path d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,40 L1440,120 L0,120 Z" fill="var(--color-sand-50)" />
            <path d="M0,60 C320,110 640,20 960,70 C1200,100 1360,60 1440,50 L1440,120 L0,120 Z" fill="var(--color-forest-100)" fillOpacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold text-forest-800 text-center mb-6">
          Key Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 text-center"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-base font-semibold font-heading text-forest-800 mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-earth-600/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Start Here CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-forest-50 border border-forest-100 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold text-forest-800 mb-2">
            Ready to start your journey?
          </h2>
          <p className="text-sm text-earth-600/70 mb-4">
            Create an account and begin documenting your travels today.
          </p>
          <Link
            to="/login"
            className="inline-block bg-earth-600 hover:bg-earth-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 text-base"
          >
            Start Here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
