export interface Partner {
  id: string;
  brand: string;
  logo: string;
  url: string;
  description: string;
  brandColor: string;
  tag: string;
  tagClass: 'blue' | 'purple' | 'orange' | 'dark';
}

export const PARTNERS: Partner[] = [
  {
    id: 'coursera',
    brand: 'Coursera',
    logo: '/partners/coursera.png',
    url: 'https://www.coursera.org',
    description: 'Accredited university degrees & certifications',
    brandColor: '#0056D2',
    tag: 'Certified',
    tagClass: 'blue',
  },
  {
    id: 'udemy',
    brand: 'Udemy',
    logo: '/partners/udemy.png',
    url: 'https://www.udemy.com',
    description: 'Practical tech & real-world skill development',
    brandColor: '#A435F0',
    tag: 'Skills',
    tagClass: 'purple',
  },
  {
    id: 'daraz',
    brand: 'Daraz',
    logo: '/partners/daraz.png',
    url: 'https://www.daraz.pk',
    description: 'Student lifestyle essentials & verified savings',
    brandColor: '#F57224',
    tag: 'Perks',
    tagClass: 'orange',
  },
  {
    id: 'edx',
    brand: 'edX',
    logo: '/partners/edx.png',
    url: 'https://www.edx.org',
    description: 'Harvard & MIT founded academic courses',
    brandColor: '#0B2329',
    tag: 'Ivy League',
    tagClass: 'dark',
  },
];
