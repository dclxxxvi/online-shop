import React from 'react';

interface FooterBlockProps {
  props: Record<string, unknown>;
}

export const FooterBlock: React.FC<FooterBlockProps> = ({ props }) => {
  const links = (props.links as string[]) || [];
  const socialLinks = (props.socialLinks as any[]) || [];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">О магазине</h3>
            <p className="text-gray-400">
              Качественные товары по выгодным ценам. Быстрая доставка по всей России.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Информация</h3>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <p className="text-gray-400">Email: info@shop.com</p>
            <p className="text-gray-400">Телефон: +7 (999) 123-45-67</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{(props.copyright as string) || '© 2024 Shop Builder'}</p>
        </div>
      </div>
    </footer>
  );
};
