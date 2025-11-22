import type { SocialPost } from '../types/socialFeed.types';

/**
 * Mock Social Feed Data
 * Featured conservation organizations and community posts
 */

export const MOCK_SOCIAL_POSTS: SocialPost[] = [
  // Green Belt Movement Posts
  {
    id: '1',
    externalId: 'gbm_001',
    platform: 'instagram',
    author: {
      name: 'Green Belt Movement',
      username: 'greenbeltmovement',
      avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiDVdHBB9dAHP9DDdwmRugm5JUiK0OzAJp3g&s',
      profileUrl: 'https://instagram.com/greenbeltmovement',
    },
    caption: '🌳 Together we planted 5,000 indigenous trees in Kakamega Forest! Our community is growing stronger every day. Join us in restoring Kenya\'s forest cover. #GangGreen #TreePlanting #KakamegaForest',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop',
    },
    postUrl: 'https://instagram.com/p/gbm001',
    engagement: {
      likes: 2845,
      comments: 234,
      shares: 156,
      total: 3235,
    },
    locationTag: 'Kakamega Forest, Kenya',
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    externalId: 'gbm_002',
    platform: 'twitter',
    author: {
      name: 'Green Belt Movement',
      username: 'GBMKenya',
      avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiDVdHBB9dAHP9DDdwmRugm5JUiK0OzAJp3g&s',
      profileUrl: 'https://twitter.com/GBMKenya',
    },
    caption: 'Celebrating 50 million trees planted since 1977! Honoring Prof. Wangari Maathai\'s legacy by continuing to empower communities through environmental conservation. 🌍💚 #GangGreen #WangariMaathai',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=400&fit=crop',
    },
    postUrl: 'https://twitter.com/GBMKenya/status/gbm002',
    engagement: {
      likes: 4521,
      comments: 389,
      shares: 892,
      total: 5802,
    },
    locationTag: 'Nairobi, Kenya',
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Antugrow Posts
  {
    id: '3',
    externalId: 'antugrow_001',
    platform: 'instagram',
    author: {
      name: 'Antugrow',
      username: 'antugrow',
      avatarUrl: 'https://antugrow.com/pwa-512x512.png',
      profileUrl: 'https://instagram.com/antugrow',
    },
    caption: '🌱 Our urban farming initiative in Nairobi is thriving! Teaching communities sustainable agriculture while reducing carbon footprint. Every seed planted is a step towards food security. #GangGreen #UrbanFarming #Sustainability',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop',
    },
    postUrl: 'https://instagram.com/p/antugrow001',
    engagement: {
      likes: 1823,
      comments: 145,
      shares: 98,
      total: 2066,
    },
    locationTag: 'Nairobi, Kenya',
    postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    externalId: 'antugrow_002',
    platform: 'facebook',
    author: {
      name: 'Antugrow Kenya',
      username: 'antugrowke',
      avatarUrl: 'https://antugrow.com/pwa-512x512.png',
      profileUrl: 'https://facebook.com/antugrowke',
    },
    caption: '📊 Impact Report: 10,000 kg of fresh produce grown using sustainable methods this quarter! Our smart agriculture tech is transforming urban farming. Join the green revolution! 🚀 #GangGreen #SmartFarming #TechForGood',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=400&fit=crop',
    },
    postUrl: 'https://facebook.com/antugrowke/posts/002',
    engagement: {
      likes: 2156,
      comments: 187,
      shares: 234,
      total: 2577,
    },
    locationTag: 'Nairobi, Kenya',
    postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Community Posts
  {
    id: '5',
    externalId: 'community_001',
    platform: 'instagram',
    author: {
      name: 'Sarah Mwangi',
      username: 'sarahmwangi_eco',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      profileUrl: 'https://instagram.com/sarahmwangi_eco',
    },
    caption: 'Spent my Saturday planting 50 trees in Karura Forest with @greenbeltmovement! Feeling so grateful to be part of this amazing community. 🌳💚 Who\'s joining next weekend? #GangGreen #KaruraForest #CommunityAction',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop',
    },
    postUrl: 'https://instagram.com/p/community001',
    engagement: {
      likes: 892,
      comments: 67,
      shares: 43,
      total: 1002,
    },
    locationTag: 'Karura Forest, Nairobi',
    postedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    externalId: 'community_002',
    platform: 'twitter',
    author: {
      name: 'James Odhiambo',
      username: 'james_green_ke',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      profileUrl: 'https://twitter.com/james_green_ke',
    },
    caption: 'Just earned my Tree Planter Gold badge! 🏆 100 trees planted and counting. The @antugrow workshops taught me so much about sustainable practices. Let\'s keep growing! 🌱 #GangGreen #TreePlanter #Achievement',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop',
    },
    postUrl: 'https://twitter.com/james_green_ke/status/002',
    engagement: {
      likes: 567,
      comments: 45,
      shares: 78,
      total: 690,
    },
    locationTag: 'Kisumu, Kenya',
    postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    externalId: 'gbm_003',
    platform: 'facebook',
    author: {
      name: 'Green Belt Movement',
      username: 'GreenBeltMovementKE',
      avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiDVdHBB9dAHP9DDdwmRugm5JUiK0OzAJp3g&s',
      profileUrl: 'https://facebook.com/GreenBeltMovementKE',
    },
    caption: '🌍 World Environment Day Special: Join us for a mega tree planting event in Mau Forest! 1,000+ volunteers expected. Register now through our website. Together we heal our planet! 🌳 #GangGreen #WorldEnvironmentDay #MauForest',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=400&h=400&fit=crop',
    },
    postUrl: 'https://facebook.com/GreenBeltMovementKE/posts/003',
    engagement: {
      likes: 5234,
      comments: 456,
      shares: 1234,
      total: 6924,
    },
    locationTag: 'Mau Forest, Kenya',
    postedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    externalId: 'community_003',
    platform: 'instagram',
    author: {
      name: 'Nairobi Youth Initiative',
      username: 'nairobiYouthInit',
      avatarUrl: 'https://i.pravatar.cc/150?img=33',
      profileUrl: 'https://instagram.com/nairobiYouthInit',
    },
    caption: '🎉 Our youth-led reforestation project reached 500 trees this month! Special thanks to @greenbeltmovement and @antugrow for the training and seedlings. Youth power for climate action! 💪🌱 #GangGreen #YouthAction #ClimateHeroes',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=400&fit=crop',
    },
    postUrl: 'https://instagram.com/p/community003',
    engagement: {
      likes: 1456,
      comments: 123,
      shares: 89,
      total: 1668,
    },
    locationTag: 'Nairobi, Kenya',
    postedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '9',
    externalId: 'antugrow_003',
    platform: 'twitter',
    author: {
      name: 'Antugrow',
      username: 'antugrow',
      avatarUrl: 'https://antugrow.com/pwa-512x512.png',
      profileUrl: 'https://twitter.com/antugrow',
    },
    caption: '💡 Innovation Alert: Launching our AI-powered irrigation system that reduces water usage by 60%! Smart farming for a sustainable future. Learn more at our workshop next week. #GangGreen #AgriTech #Innovation #WaterConservation',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=400&fit=crop',
    },
    postUrl: 'https://twitter.com/antugrow/status/003',
    engagement: {
      likes: 3421,
      comments: 234,
      shares: 567,
      total: 4222,
    },
    locationTag: 'Nairobi, Kenya',
    postedAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(), // 2.5 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '10',
    externalId: 'community_004',
    platform: 'facebook',
    author: {
      name: 'Wanjiru Kamau',
      username: 'wanjirukamau',
      avatarUrl: 'https://i.pravatar.cc/150?img=45',
      profileUrl: 'https://facebook.com/wanjirukamau',
    },
    caption: 'From barren land to thriving forest in 3 years! 🌳🌲 Our village worked with @GreenBeltMovementKE to restore 10 hectares. The impact on our water sources and wildlife is incredible! #GangGreen #Reforestation #CommunitySuccess #BeforeAndAfter',
    media: {
      type: 'carousel',
      url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=400&fit=crop',
    },
    postUrl: 'https://facebook.com/wanjirukamau/posts/004',
    engagement: {
      likes: 2789,
      comments: 312,
      shares: 445,
      total: 3546,
    },
    locationTag: 'Nyeri, Kenya',
    postedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '11',
    externalId: 'gbm_004',
    platform: 'instagram',
    author: {
      name: 'Green Belt Movement',
      username: 'greenbeltmovement',
      avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiDVdHBB9dAHP9DDdwmRugm5JUiK0OzAJp3g&s',
      profileUrl: 'https://instagram.com/greenbeltmovement',
    },
    caption: '👩‍🌾 Empowering women through environmental conservation! Our women-led tree nurseries provide sustainable income while healing the planet. Meet Jane, who runs a nursery supporting 20 families. #GangGreen #WomenEmpowerment #SustainableLivelihoods',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=400&fit=crop',
    },
    postUrl: 'https://instagram.com/p/gbm004',
    engagement: {
      likes: 3654,
      comments: 289,
      shares: 234,
      total: 4177,
    },
    locationTag: 'Kiambu, Kenya',
    postedAt: new Date(Date.now() - 84 * 60 * 60 * 1000).toISOString(), // 3.5 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 84 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '12',
    externalId: 'community_005',
    platform: 'twitter',
    author: {
      name: 'David Kipchoge',
      username: 'kipchoge_green',
      avatarUrl: 'https://i.pravatar.cc/150?img=68',
      profileUrl: 'https://twitter.com/kipchoge_green',
    },
    caption: '🏃‍♂️ Completed my first Climate Marathon! Every kilometer = 1 tree planted by sponsors. 42km = 42 trees! Thanks to all supporters and @antugrow for organizing. Running for the planet! 🌍🏃 #GangGreen #ClimateMarathon #RunForTrees',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=400&fit=crop',
    },
    postUrl: 'https://twitter.com/kipchoge_green/status/005',
    engagement: {
      likes: 1234,
      comments: 98,
      shares: 156,
      total: 1488,
    },
    locationTag: 'Nairobi, Kenya',
    postedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), // 4 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '13',
    externalId: 'antugrow_004',
    platform: 'instagram',
    author: {
      name: 'Antugrow',
      username: 'antugrow',
      avatarUrl: 'https://antugrow.com/pwa-512x512.png',
      profileUrl: 'https://instagram.com/antugrow',
    },
    caption: '🌾 Harvest season! Our vertical farming project produced 2 tons of organic vegetables this month. Zero pesticides, 90% less water, 100% sustainable. The future of agriculture is here! 🚀 #GangGreen #VerticalFarming #OrganicFood #FoodSecurity',
    media: {
      type: 'carousel',
      url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=400&fit=crop',
    },
    postUrl: 'https://instagram.com/p/antugrow004',
    engagement: {
      likes: 2967,
      comments: 178,
      shares: 234,
      total: 3379,
    },
    locationTag: 'Nairobi, Kenya',
    postedAt: new Date(Date.now() - 108 * 60 * 60 * 1000).toISOString(), // 4.5 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 108 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '14',
    externalId: 'gbm_005',
    platform: 'facebook',
    author: {
      name: 'Green Belt Movement',
      username: 'GreenBeltMovementKE',
      avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiDVdHBB9dAHP9DDdwmRugm5JUiK0OzAJp3g&s',
      profileUrl: 'https://facebook.com/GreenBeltMovementKE',
    },
    caption: '📚 Education + Action = Change! Our schools program reached 100 schools this year. Students don\'t just learn about climate change - they fight it by planting school forests. Youth are the future! 🌱📖 #GangGreen #ClimateEducation #SchoolForests',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop',
    },
    postUrl: 'https://facebook.com/GreenBeltMovementKE/posts/005',
    engagement: {
      likes: 4123,
      comments: 345,
      shares: 678,
      total: 5146,
    },
    locationTag: 'Nakuru, Kenya',
    postedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(), // 5 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '15',
    externalId: 'community_006',
    platform: 'instagram',
    author: {
      name: 'Aisha Mohammed',
      username: 'aisha_eco_warrior',
      avatarUrl: 'https://i.pravatar.cc/150?img=20',
      profileUrl: 'https://instagram.com/aisha_eco_warrior',
    },
    caption: '🌊 Beach cleanup turned into mangrove planting session! Removed 200kg of plastic and planted 300 mangrove seedlings. Protecting our coastline one action at a time. Join us next month! #GangGreen #BeachCleanup #MangroveRestoration #CoastalConservation',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400&h=400&fit=crop',
    },
    postUrl: 'https://instagram.com/p/community006',
    engagement: {
      likes: 1876,
      comments: 145,
      shares: 123,
      total: 2144,
    },
    locationTag: 'Mombasa, Kenya',
    postedAt: new Date(Date.now() - 132 * 60 * 60 * 1000).toISOString(), // 5.5 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 132 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '16',
    externalId: 'antugrow_005',
    platform: 'twitter',
    author: {
      name: 'Antugrow',
      username: 'antugrow',
      avatarUrl: 'https://antugrow.com/pwa-512x512.png',
      profileUrl: 'https://twitter.com/antugrow',
    },
    caption: '🎓 Free Workshop Alert! Learn hydroponic farming, composting, and urban gardening. Limited to 50 participants. Register through link in bio. Let\'s grow together! 🌱 #GangGreen #FreeWorkshop #UrbanGardening #Hydroponics #Sustainability',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    },
    postUrl: 'https://twitter.com/antugrow/status/005',
    engagement: {
      likes: 2345,
      comments: 234,
      shares: 389,
      total: 2968,
    },
    locationTag: 'Nairobi, Kenya',
    postedAt: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(), // 6 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '17',
    externalId: 'community_007',
    platform: 'facebook',
    author: {
      name: 'Eldoret Green Warriors',
      username: 'eldoretgreenwarriors',
      avatarUrl: 'https://i.pravatar.cc/150?img=52',
      profileUrl: 'https://facebook.com/eldoretgreenwarriors',
    },
    caption: '🏆 Community milestone: 1 year, 10,000 trees, 500 volunteers! Thank you @GreenBeltMovementKE for guidance and @antugrow for seedlings. Our city is greener and our community is stronger. Here\'s to year 2! 🌳💚 #GangGreen #CommunityPower #Milestone',
    media: {
      type: 'carousel',
      url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=400&fit=crop',
    },
    postUrl: 'https://facebook.com/eldoretgreenwarriors/posts/007',
    engagement: {
      likes: 3421,
      comments: 267,
      shares: 456,
      total: 4144,
    },
    locationTag: 'Eldoret, Kenya',
    postedAt: new Date(Date.now() - 156 * 60 * 60 * 1000).toISOString(), // 6.5 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 156 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '18',
    externalId: 'gbm_006',
    platform: 'twitter',
    author: {
      name: 'Green Belt Movement',
      username: 'GBMKenya',
      avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiDVdHBB9dAHP9DDdwmRugm5JUiK0OzAJp3g&s',
      profileUrl: 'https://twitter.com/GBMKenya',
    },
    caption: '🌍 COP Summit Update: Representing Kenya\'s grassroots movement on the global stage. Communities leading climate action from the ground up. Your local actions have global impact! 🌳🌍 #GangGreen #COP #ClimateAction #GrassrootsMovement',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&h=800&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=400&fit=crop',
    },
    postUrl: 'https://twitter.com/GBMKenya/status/006',
    engagement: {
      likes: 6234,
      comments: 567,
      shares: 1234,
      total: 8035,
    },
    locationTag: 'Global',
    postedAt: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(), // 7 days ago
    fetchedAt: new Date().toISOString(),
    moderationStatus: 'approved',
    isVisible: true,
    createdAt: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Filter mock posts by platform
 */
export function filterMockPostsByPlatform(platform: string): SocialPost[] {
  if (platform === 'all') return MOCK_SOCIAL_POSTS;
  return MOCK_SOCIAL_POSTS.filter((post) => post.platform === platform);
}

/**
 * Search mock posts
 */
export function searchMockPosts(query: string): SocialPost[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_SOCIAL_POSTS.filter(
    (post) =>
      post.caption.toLowerCase().includes(lowerQuery) ||
      post.author.name.toLowerCase().includes(lowerQuery) ||
      post.author.username.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Sort mock posts
 */
export function sortMockPosts(posts: SocialPost[], sortBy: 'recent' | 'popular'): SocialPost[] {
  const sorted = [...posts];

  if (sortBy === 'popular') {
    return sorted.sort((a, b) => b.engagement.total - a.engagement.total);
  }

  // Default: sort by most recent
  return sorted.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}
