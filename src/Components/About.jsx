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

