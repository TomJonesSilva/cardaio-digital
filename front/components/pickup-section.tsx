import { MapPin, ChevronRight } from 'lucide-react';

export default function PickupSection() {
  const endereco = 'Av. Domingos Ferreira, 2218 - Boa Viagem';
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(endereco)}`;
  const abrirLocalizacao = () => {
    window.open(mapsUrl, '_blank'); // abre em nova aba
  };
  return (
    <div className="bg-white px-4 py-4 border-b border-gray-200">
      <div
        onClick={abrirLocalizacao}
        className="flex items-center justify-between bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition"
      >
        <div className="flex items-start gap-3">
          <MapPin size={24} className="text-gray-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Estabelecimento
            </h3>
            <p className="text-sm text-gray-600">
              Av. Domingos Ferreira, 2218 - Boa Viagem
            </p>
          </div>
        </div>
        <ChevronRight size={24} className="text-gray-400 flex-shrink-0" />
      </div>
    </div>
  );
}
