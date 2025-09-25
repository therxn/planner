import { useState, useEffect } from 'react';
import ApartmentDetail from './ApartmentDetail';
import ApartmentDetailMobile from './ApartmentDetailMobile';

// Responsive Apartment-Detail-Komponente
const ApartmentDetailResponsive = ({ 
  apartment, 
  isOpen, 
  onClose, 
  onEdit, 
  onUpdateApartment,
  bookings = [], 
  onAddBooking, 
  onUpdateBooking, 
  onDeleteBooking 
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Prüfe Bildschirmgröße
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Verwende mobile Version für kleine Bildschirme
  if (isMobile) {
    return (
      <ApartmentDetailMobile
        apartment={apartment}
        isOpen={isOpen}
        onClose={onClose}
        onEdit={onEdit}
        onUpdateApartment={onUpdateApartment}
        bookings={bookings}
        onAddBooking={onAddBooking}
        onUpdateBooking={onUpdateBooking}
        onDeleteBooking={onDeleteBooking}
      />
    );
  }

  // Verwende Desktop-Version für größere Bildschirme
  return (
    <ApartmentDetail
      apartment={apartment}
      isOpen={isOpen}
      onClose={onClose}
      onEdit={onEdit}
      onUpdateApartment={onUpdateApartment}
      bookings={bookings}
      onAddBooking={onAddBooking}
      onUpdateBooking={onUpdateBooking}
      onDeleteBooking={onDeleteBooking}
    />
  );
};

export default ApartmentDetailResponsive;