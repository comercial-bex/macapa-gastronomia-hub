
-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT ''
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Admin insert
CREATE POLICY "Admin insert settings"
ON public.site_settings
FOR INSERT
WITH CHECK (is_admin());

-- Admin update
CREATE POLICY "Admin update settings"
ON public.site_settings
FOR UPDATE
USING (is_admin());

-- Admin delete
CREATE POLICY "Admin delete settings"
ON public.site_settings
FOR DELETE
USING (is_admin());

-- Insert initial data
INSERT INTO public.site_settings (chave, valor, descricao) VALUES
('hero_titulo', 'Sabor e tradição em Macapá desde 1998', 'Título principal do site'),
('hero_subtitulo', 'Uma casa feita de encontros, histórias e pratos que viram memória.', 'Subtítulo do hero'),
('historia_titulo', 'A História', 'Título da seção história'),
('historia_texto', 'Inaugurado em abril de 1998, o Restaurante Macapabá nasceu do sonho de oferecer aos macapaenses uma experiência gastronômica única. Ao longo de mais de 25 anos, nos tornamos referência em culinária regional, combinando sabores amazônicos com técnicas contemporâneas. Nosso compromisso com a qualidade e o atendimento nos consolidou como um dos restaurantes mais tradicionais e queridos de Macapá.', 'Texto da seção história'),
('historia_subtitulo', 'Desde 1998', 'Subtítulo da seção história'),
('telefone_principal', '(96) 98105-4789', 'Telefone principal (header)'),
('whatsapp_numero', '5596981054789', 'Número WhatsApp (sem formatação)'),
('instagram_url', 'https://instagram.com/restaurantemacapaba', 'Link Instagram'),
('facebook_url', 'https://facebook.com/restaurantemacapaba', 'Link Facebook'),
('email_contato', 'restaurantemacapaba123@gmail.com', 'E-mail de contato'),
('footer_descricao', 'Sabor e tradição em Macapá desde 1998. Uma casa feita de encontros, histórias e pratos que viram memória.', 'Texto descritivo do footer'),
('cta_titulo', 'Reserve sua mesa agora', 'Título CTA final'),
('cta_subtitulo', 'Garanta seu lugar para uma experiência gastronômica única no coração de Macapá.', 'Subtítulo CTA final');
