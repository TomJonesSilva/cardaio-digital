import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import PickupSection from './pickup-section';

interface HeaderProps {
  restaurantName?: string;
  onRestaurantOpenChange?: (isOpen: boolean) => void;
}

export default function Header({
  restaurantName = 'Tempero de Mainha',
  onRestaurantOpenChange,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      const hours = now.getHours();
      const open = hours >= 6 && hours < 23; // aberto entre 06:00 e 14:00
      setIsOpen(open);
      if (onRestaurantOpenChange) onRestaurantOpenChange(open);
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60 * 1000); // atualiza a cada minuto
    return () => clearInterval(interval);
  }, [onRestaurantOpenChange]);

  return (
    <div className="bg-red-600 pt-8 pb-12 relative">
      {/* Logo Circle 
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-white rounded-full border-4 border-red-600 flex items-center justify-center shadow-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">👩🏻‍🍳</div>
            <div className="text-xs font-bold text-red-600">Cardápio</div>
          </div>
        </div>
      </div>
*/}
      {/* White Card Section */}
      <div className="bg-white rounded-t-3xl pt-8 px-6 pb-6">
        {/* Restaurant Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          {restaurantName}
        </h1>
        {/* Location and Info 

        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
          <MapPin size={18} className="text-gray-600" />
          <span className="text-sm">Recife - PE</span>
          <span className="text-gray-400">•</span>
        </div>
        */}

        {/* Status */}
        <div className="text-center">
          <p
            className={`text-lg font-bold ${isOpen ? 'text-green-500' : 'text-red-500'}`}
          >
            {isOpen
              ? 'Aberto até às 14:00 horas'
              : 'Fechado no momento. Horario de funcionamento 06:00 ás 14:00 horas'}
          </p>
        </div>
        <PickupSection />
      </div>
    </div>
  );
}
