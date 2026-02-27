import { Link } from 'react-router-dom'

const steps = [
  {
    number: '1',
    title: 'Create an Account',
    description:
      'Sign up for a free account to start tracking your travels. Your personal data is saved so you can access it anytime.',
    linkTo: '/register',
    linkLabel: 'Sign Up',
  },
  {
    number: '2',
    title: 'Explore the Map',
    description:
      'Open the interactive map and click on any location to mark a place you\'ve visited. You can zoom, pan, and browse the entire world.',
    linkTo: '/map',
    linkLabel: 'Open Map',
  },
  {
    number: '3',
    title: 'Add Your Visits',
    description:
      'When you add a location, fill in details like the place name, the date you visited, and any notes or memories from your trip.',
  },
  {
    number: '4',
    title: 'View Your History',
    description:
      'Head to your Personal History page to see every place you\'ve been. Sort and browse through all your past visits in one place.',
    linkTo: '/history',
    linkLabel: 'View History',
  },
  {
    number: '5',
    title: 'Check the Leaderboard',
    description:
      'See how your travels compare with others. The leaderboard ranks users by number of places visited and shows the most popular destinations.',
    linkTo: '/leaderboard',
    linkLabel: 'Leaderboard',
  },
]

function About() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-b from-ocean-50 to-sand-50 py-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-forest-800 mb-3">
            How to Use GeoJournal
          </h1>
          <p className="text-base text-earth-600/80 max-w-xl mx-auto font-body">
            GeoJournal helps you track the places you've visited, write about
            your adventures, and build your personal travel journal.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-4 bg-white border border-sand-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-forest-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {step.number}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-forest-800 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-earth-600/70 mb-2">
                  {step.description}
                </p>
                {step.linkTo && (
                  <Link
                    to={step.linkTo}
                    className="text-sm font-medium text-ocean-600 hover:text-ocean-800 transition-colors"
                  >
                    {step.linkLabel} &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Info */}
      <div className="max-w-3xl mx-auto px-4 pb-10">
        <div className="bg-forest-50 border border-forest-100 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold text-forest-800 mb-2">
            About the Project
          </h2>
          <p className="text-sm text-earth-600/70">
            GeoJournal is built with React and a Flask REST API backed by
            MongoDB. It was created as a full-stack project to combine
            geographic data with personal travel journaling.
          </p>
        </div>
      </div>
    </div>
  )
}

export default About

