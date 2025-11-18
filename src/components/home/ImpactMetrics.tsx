import React, { useState, useEffect, useRef } from 'react';

interface MetricsData {
  treesPlanted: number;
  carbonSequestered: number;
  activeUsers: number;
  badgesEarned: number;
}

interface ImpactMetricsProps {
  initialMetrics?: MetricsData;
  refreshInterval?: number;
}

interface MetricCardProps {
  icon: string;
  value: number;
  label: string;
  unit?: string;
  animationDuration?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  value,
  label,
  unit = '',
  animationDuration = 2000,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const endTime = startTime + animationDuration;

    const updateCounter = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / animationDuration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(easeOutQuart * value);
      
      setDisplayValue(currentValue);

      if (now < endTime) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [isVisible, value, animationDuration]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <div className="text-4xl font-bold text-green-600 mb-2">
        {formatNumber(displayValue)}
        {unit && <span className="text-2xl ml-1">{unit}</span>}
      </div>
      <div className="text-lg text-gray-600 font-medium">{label}</div>
    </div>
  );
};

export const ImpactMetrics: React.FC<ImpactMetricsProps> = ({
  initialMetrics,
  refreshInterval = 60000,
}) => {
  const [metrics, setMetrics] = useState<MetricsData>(
    initialMetrics || {
      treesPlanted: 12543,
      carbonSequestered: 45.2,
      activeUsers: 3847,
      badgesEarned: 1256,
    }
  );

  useEffect(() => {
    // Fetch real metrics from API/database
    const fetchMetrics = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/home/metrics');
        // const data = await response.json();
        // setMetrics(data);
        
        // For now, simulate slight increases
        setMetrics((prev) => ({
          treesPlanted: prev.treesPlanted + Math.floor(Math.random() * 5),
          carbonSequestered: prev.carbonSequestered + Math.random() * 0.5,
          activeUsers: prev.activeUsers + Math.floor(Math.random() * 3),
          badgesEarned: prev.badgesEarned + Math.floor(Math.random() * 2),
        }));
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    // Set up interval for real-time updates
    const intervalId = setInterval(fetchMetrics, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Impact in Real-Time
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Watch as our community grows and makes a tangible difference in Africa's forests.
            Every number represents real action and real impact.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <MetricCard
            icon="🌳"
            value={metrics.treesPlanted}
            label="Trees Planted"
          />
          <MetricCard
            icon="🌍"
            value={metrics.carbonSequestered}
            label="Carbon Sequestered"
            unit="tons"
          />
          <MetricCard
            icon="👥"
            value={metrics.activeUsers}
            label="Active Heroes"
          />
          <MetricCard
            icon="🏆"
            value={metrics.badgesEarned}
            label="NFT Badges Earned"
          />
        </div>
      </div>
    </section>
  );
};
