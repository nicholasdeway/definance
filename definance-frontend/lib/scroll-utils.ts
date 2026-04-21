"use client"


/* Utilitário para realizar scroll suave para elementos na Landing Page.
* Lida com navegação interna (na mesma página) e externa (de outras páginas para a home). */

export const scrollToSection = (id: string) => {
  const element = document.getElementById(id);

  if (element) {
    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    return true;
  }

  return false;
};

/**
 * Hook para gerenciar a navegação por seções.
 */
import { useRouter, usePathname } from 'next/navigation';

export const useSectionNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToSection = (sectionId: string, e?: React.MouseEvent) => {
    const id = sectionId.includes('#') ? sectionId.split('#')[1] : sectionId;

    if (!id || id === '/') {
      if (e) e.preventDefault();
      if (pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/');
      }
      return;
    }

    if (pathname === '/') {
      if (e) e.preventDefault();
      const success = scrollToSection(id);

      if (!success) {
        console.warn(`Elemento com id #${id} não encontrado na página atual.`);
      }
    } else {
    }
  };

  return { navigateToSection };
};