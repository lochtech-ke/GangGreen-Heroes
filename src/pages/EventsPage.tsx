import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  ChevronRight,
  CalendarDays,
  TreePine,
  Sprout,
  Waves,
  Mountain,
  BadgeCheck,
  Share2,
} from 'lucide-react';

// Event types matching our conservation focus
type EventType = 'tree-planting' | 'workshop' | 'cleanup' | 'fundraiser' | 'webinar' | 'community';
type EventStatus = 'upcoming' | 'ongoing' | 'completed';

interface Event {
  id: number;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  image: string;
  date: Date;
  endDate?: Date;
  time: string;
  location: string;
  organizer: {
    name: string;
    logo: string;
  };
  attendees: number;
  capacity: number;
  isRegistered: boolean;
  isFeatured: boolean;
  tags: string[];
}

// Mock events data
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: 'Kakamega Forest Mega Tree Planting',
    description: 'Join us for our biggest tree planting event of the year! We aim to plant 10,000 indigenous trees in Kakamega Forest. All materials, refreshments, and training provided.',
    type: 'tree-planting',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=600&fit=crop',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    time: '8:00 AM - 2:00 PM',
    location: 'Kakamega Forest, Kenya',
    organizer: {
      name: 'Green Belt Movement',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiDVdHBB9dAHP9DDdwmRugm5JUiK0OzAJp3g&s',
    },
    attendees: 847,
    capacity: 1000,
    isRegistered: false,
    isFeatured: true,
    tags: ['tree-planting', 'forest-restoration', 'community'],
  },
  {
    id: 2,
    title: 'Wangari Maathai Hackathon',
    description: 'Join us for an inspiring hackathon honoring Prof. Wangari Maathai\'s legacy! Develop innovative tech solutions for environmental conservation. Teams will compete to create apps, platforms, and tools that empower communities in climate action.',
    type: 'workshop',
    status: 'upcoming',
    image: 'https://media.licdn.com/dms/image/v2/D4D22AQEEB7hXd4-Cuw/feedshare-shrink_800/B4DZovHn6_JAAo-/0/1761727129463?e=1765411200&v=beta&t=r_SaJAw2wYVSECuKdXYpxWforzZzgdriZwhiQQZk27I',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    time: '9:00 AM - 6:00 PM',
    location: 'Green Belt Movement HQ, Nairobi',
    organizer: {
      name: 'Green Belt Movement',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiDVdHBB9dAHP9DDdwmRugm5JUiK0OzAJp3g&s',
    },
    attendees: 45,
    capacity: 50,
    isRegistered: true,
    isFeatured: true,
    tags: ['hackathon', 'tech-for-good', 'innovation', 'wangari-maathai'],
  },
  {
    id: 3,
    title: 'Coastal Cleanup & Mangrove Planting',
    description: 'Beach cleanup followed by mangrove planting session. Help protect our coastline while removing plastic waste. Gloves and tools provided.',
    type: 'cleanup',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200&h=600&fit=crop',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    time: '6:00 AM - 12:00 PM',
    location: 'Diani Beach, Mombasa',
    organizer: {
      name: 'Coastal Conservation Kenya',
      logo: 'https://i.pravatar.cc/150?img=20',
    },
    attendees: 156,
    capacity: 200,
    isRegistered: false,
    isFeatured: true,
    tags: ['cleanup', 'mangroves', 'coastal'],
  },
  {
    id: 4,
    title: 'Climate Action Fundraiser Gala',
    description: 'Annual fundraiser supporting grassroots conservation projects across Kenya. Live music, dinner, and silent auction. Black tie optional.',
    type: 'fundraiser',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=600&fit=crop',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    time: '6:00 PM - 11:00 PM',
    location: 'Sarova Stanley, Nairobi',
    organizer: {
      name: 'Green Belt Movement',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiDVdHBB9dAHP9DDdwmRugm5JUiK0OzAJp3g&s',
    },
    attendees: 234,
    capacity: 500,
    isRegistered: false,
    isFeatured: false,
    tags: ['fundraiser', 'gala', 'networking'],
  },
  {
    id: 5,
    title: 'Webinar: Carbon Credits for Smallholder Farmers',
    description: 'Online session explaining how farmers can earn carbon credits through sustainable practices. Expert panel and Q&A session.',
    type: 'webinar',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    time: '2:00 PM - 4:00 PM (Online)',
    location: 'Virtual Event',
    organizer: {
      name: 'Kenya Climate Innovation Center',
      logo: 'https://i.pravatar.cc/150?img=33',
    },
    attendees: 567,
    capacity: 1000,
    isRegistered: true,
    isFeatured: false,
    tags: ['webinar', 'carbon-credits', 'farming'],
  },
  {
    id: 6,
    title: 'Community Forest Walk & Bird Watching',
    description: 'Guided nature walk through Karura Forest. Learn about indigenous species, bird watching, and forest conservation. Family-friendly event.',
    type: 'community',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1200&h=600&fit=crop',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    time: '7:00 AM - 10:00 AM',
    location: 'Karura Forest, Nairobi',
    organizer: {
      name: 'Friends of Karura Forest',
      logo: 'https://i.pravatar.cc/150?img=52',
    },
    attendees: 89,
    capacity: 100,
    isRegistered: false,
    isFeatured: false,
    tags: ['community', 'nature-walk', 'education'],
  },
  {
    id: 7,
    title: 'Youth Climate Summit 2025',
    description: '3-day youth-led climate summit featuring workshops, panel discussions, and networking. University students and young professionals welcome.',
    type: 'community',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
    time: '9:00 AM - 5:00 PM (3 days)',
    location: 'KICC, Nairobi',
    organizer: {
      name: 'Youth for Climate Action',
      logo: 'https://i.pravatar.cc/150?img=68',
    },
    attendees: 432,
    capacity: 800,
    isRegistered: true,
    isFeatured: true,
    tags: ['summit', 'youth', 'climate-action'],
  },
  {
    id: 8,
    title: 'Seedling Distribution Drive',
    description: 'Free native tree seedlings distribution to community members. First come, first served. Planting guides and support provided.',
    type: 'community',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&h=600&fit=crop',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    time: '8:00 AM - 12:00 PM',
    location: 'Uhuru Park, Nairobi',
    organizer: {
      name: 'Green Belt Movement',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiDVdHBB9dAHP9DDdwmRugm5JUiK0OzAJp3g&s',
    },
    attendees: 234,
    capacity: 500,
    isRegistered: false,
    isFeatured: false,
    tags: ['seedlings', 'free', 'community'],
  },
];

export function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter events
  const filteredEvents = MOCK_EVENTS.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || event.type === selectedType;

    return matchesSearch && matchesType;
  });

  // Calculate stats
  const upcomingEvents = MOCK_EVENTS.filter((e) => e.status === 'upcoming').length;
  const registeredEvents = MOCK_EVENTS.filter((e) => e.isRegistered).length;
  const totalAttendees = MOCK_EVENTS.reduce((sum, e) => sum + e.attendees, 0);
  const featuredEvents = MOCK_EVENTS.filter((e) => e.isFeatured);

  // Event handlers
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const handleSponsorClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Sponsor ${event.title}! This feature will redirect to sponsorship page.`);
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'tree-planting':
        return <TreePine className="w-4 h-4" />;
      case 'workshop':
        return <Sprout className="w-4 h-4" />;
      case 'cleanup':
        return <Waves className="w-4 h-4" />;
      case 'fundraiser':
        return <BadgeCheck className="w-4 h-4" />;
      case 'webinar':
        return <CalendarDays className="w-4 h-4" />;
      case 'community':
        return <Mountain className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case 'tree-planting':
        return 'bg-green-100 text-green-700';
      case 'workshop':
        return 'bg-blue-100 text-blue-700';
      case 'cleanup':
        return 'bg-cyan-100 text-cyan-700';
      case 'fundraiser':
        return 'bg-purple-100 text-purple-700';
      case 'webinar':
        return 'bg-orange-100 text-orange-700';
      case 'community':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatEventDate = (date: Date, endDate?: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    if (endDate) {
      return `${date.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    }

    return date.toLocaleDateString('en-US', options);
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    if (days < 14) return 'Next week';
    return `In ${Math.ceil(days / 7)} weeks`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conservation Events</h1>
          <p className="text-gray-600 mt-1">Join local events and make a difference in your community</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors shadow-sm">
          <Calendar className="w-5 h-5" />
          <span className="hidden sm:inline">Create Event</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{upcomingEvents}</div>
              <div className="text-sm text-gray-600">Upcoming Events</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">This month</div>
        </div>

        {/* Registered Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BadgeCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{registeredEvents}</div>
              <div className="text-sm text-gray-600">Registered</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Your events</div>
        </div>

        {/* Total Attendees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalAttendees.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Attendees</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Across all events</div>
        </div>

        {/* Featured Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TreePine className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{featuredEvents.length}</div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Top picks for you</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedType === 'all'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setSelectedType('tree-planting')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedType === 'tree-planting'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tree Planting
            </button>
            <button
              onClick={() => setSelectedType('workshop')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedType === 'workshop'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Workshops
            </button>
            <button
              onClick={() => setSelectedType('cleanup')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedType === 'cleanup'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cleanups
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => handleEventClick(event)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
          >
            {/* Event Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {event.isFeatured && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  ⭐ Featured
                </div>
              )}
              {event.isRegistered && (
                <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  ✓ Registered
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-center gap-2">
                  <img
                    src={event.organizer.logo}
                    alt={event.organizer.name}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <span className="text-white text-sm font-medium">{event.organizer.name}</span>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-6">
              {/* Event Type Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.type)}`}>
                  {getEventTypeIcon(event.type)}
                  {event.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
                <span className="text-xs font-semibold text-orange-600">
                  {getDaysUntil(event.date)}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                {event.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {event.description}
              </p>

              {/* Event Info */}
              <div className="space-y-2 mb-4">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatEventDate(event.date, event.endDate)}</span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{event.time}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{event.location}</span>
                </div>

                {/* Attendees */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>
                    {event.attendees} / {event.capacity} attendees
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleEventClick(event)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    event.isRegistered
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-green-700 text-white hover:bg-green-800'
                  }`}
                >
                  {event.isRegistered ? 'View Details' : 'Register Now'}
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleSponsorClick(event, e)}
                  className="px-4 py-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold transition-colors whitespace-nowrap"
                >
                  💎 Sponsor
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Calendar className="w-24 h-24 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
          <p className="text-gray-500 text-center max-w-md">
            We couldn't find any events matching your filters. Try adjusting your search or check back later.
          </p>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSponsor={handleSponsorClick}
        />
      )}
    </div>
  );
}

// Event Detail Modal Component
interface EventDetailModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSponsor: (event: Event, e: React.MouseEvent) => void;
}

function EventDetailModal({ event, isOpen, onClose, onSponsor }: EventDetailModalProps) {
  if (!isOpen) return null;

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'tree-planting':
        return <TreePine className="w-5 h-5" />;
      case 'workshop':
        return <Sprout className="w-5 h-5" />;
      case 'cleanup':
        return <Waves className="w-5 h-5" />;
      case 'fundraiser':
        return <BadgeCheck className="w-5 h-5" />;
      case 'webinar':
        return <CalendarDays className="w-5 h-5" />;
      case 'community':
        return <Mountain className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case 'tree-planting':
        return 'bg-green-100 text-green-700';
      case 'workshop':
        return 'bg-blue-100 text-blue-700';
      case 'cleanup':
        return 'bg-cyan-100 text-cyan-700';
      case 'fundraiser':
        return 'bg-purple-100 text-purple-700';
      case 'webinar':
        return 'bg-orange-100 text-orange-700';
      case 'community':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatEventDate = (date: Date, endDate?: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };

    if (endDate) {
      return `${date.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    }

    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-72 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {event.isFeatured && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                ⭐ Featured Event
              </div>
            )}
            {event.isRegistered && (
              <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                ✓ You're Registered
              </div>
            )}
          </div>

          {/* Organizer Badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg">
            <img
              src={event.organizer.logo}
              alt={event.organizer.name}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-xs text-gray-600">Organized by</p>
              <p className="font-bold text-gray-900">{event.organizer.name}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Event Type Badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getEventTypeColor(event.type)}`}>
              {getEventTypeIcon(event.type)}
              {event.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h2>

          {/* Description */}
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">{event.description}</p>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Date */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Date</p>
                <p className="text-gray-900 font-medium">{formatEventDate(event.date, event.endDate)}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Time</p>
                <p className="text-gray-900 font-medium">{event.time}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Location</p>
                <p className="text-gray-900 font-medium">{event.location}</p>
              </div>
            </div>

            {/* Attendees */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-1">Attendees</p>
                <p className="text-gray-900 font-medium mb-2">
                  {event.attendees} / {event.capacity} registered
                </p>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {event.capacity - event.attendees} spots remaining
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                event.isRegistered
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              {event.isRegistered ? (
                <>
                  <BadgeCheck className="w-5 h-5" />
                  You're Registered
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  Register for Event
                </>
              )}
            </button>

            <button
              onClick={(e) => onSponsor(event, e)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold transition-colors"
            >
              💎 Sponsor This Event
            </button>

            <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-blue-900 mb-1">Event Information</p>
                <p className="text-sm text-blue-800">
                  By registering for this event, you'll receive updates and reminders via email.
                  Please arrive 15 minutes early for check-in. All necessary materials will be provided.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
