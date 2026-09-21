-- Seed: Initial Category Tree
-- Creates the complete hierarchical category structure

-- Helper function to insert category and return ID
CREATE OR REPLACE FUNCTION insert_category(
  p_name TEXT,
  p_slug TEXT,
  p_parent_slug TEXT DEFAULT NULL,
  p_icon TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_sort_order INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_parent_id UUID;
  v_category_id UUID;
BEGIN
  -- Get parent ID if parent_slug is provided
  IF p_parent_slug IS NOT NULL THEN
    SELECT id INTO v_parent_id FROM categories WHERE slug = p_parent_slug;
    IF v_parent_id IS NULL THEN
      RAISE EXCEPTION 'Parent category with slug "%" not found', p_parent_slug;
    END IF;
  END IF;
  
  -- Insert category
  INSERT INTO categories (name, slug, parent_id, icon, description, sort_order, status, is_visible)
  VALUES (p_name, p_slug, v_parent_id, p_icon, p_description, p_sort_order, 'ACTIVE', TRUE)
  RETURNING id INTO v_category_id;
  
  RETURN v_category_id;
END;
$$ LANGUAGE plpgsql;

-- Start transaction
BEGIN;

-- ============ КРАСОТА И УХОД ============
SELECT insert_category('Красота и уход', 'beauty', NULL, '💅', 'Услуги красоты и ухода за собой', 1);

-- Волосы
SELECT insert_category('Волосы', 'beauty-hair', 'beauty', '💇', 'Услуги для волос', 1);
SELECT insert_category('Парикмахер', 'beauty-hair-hairdresser', 'beauty-hair', NULL, 'Стрижки и укладки', 1);
SELECT insert_category('Барбер', 'beauty-hair-barber', 'beauty-hair', NULL, 'Мужские стрижки', 2);
SELECT insert_category('Колорист', 'beauty-hair-colorist', 'beauty-hair', NULL, 'Окрашивание волос', 3);
SELECT insert_category('Стилист', 'beauty-hair-stylist', 'beauty-hair', NULL, 'Создание образов', 4);
SELECT insert_category('Наращивание волос', 'beauty-hair-extensions', 'beauty-hair', NULL, 'Наращивание волос', 5);
SELECT insert_category('Кератин / ботокс / уход', 'beauty-hair-care', 'beauty-hair', NULL, 'Уход за волосами', 6);
SELECT insert_category('Причёски / плетение', 'beauty-hair-styling', 'beauty-hair', NULL, 'Прически и плетение', 7);

-- Ногти
SELECT insert_category('Ногти', 'beauty-nails', 'beauty', '💅', 'Услуги для ногтей', 2);
SELECT insert_category('Маникюр', 'beauty-nails-manicure', 'beauty-nails', NULL, 'Маникюр', 1);
SELECT insert_category('Классический', 'beauty-nails-manicure-classic', 'beauty-nails-manicure', NULL, 'Классический маникюр', 1);
SELECT insert_category('Аппаратный', 'beauty-nails-manicure-hardware', 'beauty-nails-manicure', NULL, 'Аппаратный маникюр', 2);
SELECT insert_category('Комбинированный', 'beauty-nails-manicure-combined', 'beauty-nails-manicure', NULL, 'Комбинированный маникюр', 3);
SELECT insert_category('С покрытием', 'beauty-nails-manicure-coating', 'beauty-nails-manicure', NULL, 'Маникюр с покрытием', 4);
SELECT insert_category('Педикюр', 'beauty-nails-pedicure', 'beauty-nails', NULL, 'Педикюр', 2);
SELECT insert_category('Наращивание', 'beauty-nails-extension', 'beauty-nails', NULL, 'Наращивание ногтей', 3);
SELECT insert_category('Дизайн ногтей', 'beauty-nails-design', 'beauty-nails', NULL, 'Дизайн ногтей', 4);

-- Лицо
SELECT insert_category('Лицо', 'beauty-face', 'beauty', '✨', 'Услуги для лица', 3);
SELECT insert_category('Косметолог', 'beauty-face-cosmetologist', 'beauty-face', NULL, 'Косметологические услуги', 1);
SELECT insert_category('Чистка лица', 'beauty-face-cleansing', 'beauty-face', NULL, 'Чистка лица', 2);
SELECT insert_category('Уходовые процедуры', 'beauty-face-care', 'beauty-face', NULL, 'Уходовые процедуры', 3);
SELECT insert_category('Брови', 'beauty-face-eyebrows', 'beauty-face', NULL, 'Услуги для бровей', 4);
SELECT insert_category('Ламинирование', 'beauty-face-lamination', 'beauty-face', NULL, 'Ламинирование', 5);
SELECT insert_category('Макияж', 'beauty-face-makeup', 'beauty-face', NULL, 'Макияж', 6);

-- Ресницы
SELECT insert_category('Ресницы', 'beauty-eyelashes', 'beauty', '👁', 'Услуги для ресниц', 4);
SELECT insert_category('Наращивание ресниц', 'beauty-eyelashes-extension', 'beauty-eyelashes', NULL, 'Наращивание ресниц', 1);
SELECT insert_category('Ламинирование ресниц', 'beauty-eyelashes-lamination', 'beauty-eyelashes', NULL, 'Ламинирование ресниц', 2);
SELECT insert_category('Окрашивание ресниц', 'beauty-eyelashes-tinting', 'beauty-eyelashes', NULL, 'Окрашивание ресниц', 3);

-- Тело
SELECT insert_category('Тело', 'beauty-body', 'beauty', '💆', 'Услуги для тела', 5);
SELECT insert_category('Массаж', 'beauty-body-massage', 'beauty-body', NULL, 'Массаж', 1);
SELECT insert_category('SPA', 'beauty-body-spa', 'beauty-body', NULL, 'SPA процедуры', 2);
SELECT insert_category('Шугаринг', 'beauty-body-sugaring', 'beauty-body', NULL, 'Шугаринг', 3);
SELECT insert_category('Депиляция', 'beauty-body-depilation', 'beauty-body', NULL, 'Депиляция', 4);

-- ============ ЗДОРОВЬЕ И WELLNESS ============
SELECT insert_category('Здоровье и Wellness', 'health', NULL, '🧘', 'Услуги для здоровья и благополучия', 2);
SELECT insert_category('Массаж', 'health-massage', 'health', NULL, 'Оздоровительный массаж', 1);
SELECT insert_category('Фитнес', 'health-fitness', 'health', NULL, 'Фитнес услуги', 2);
SELECT insert_category('Персональный тренер', 'health-fitness-trainer', 'health-fitness', NULL, 'Персональный тренинг', 1);
SELECT insert_category('Йога', 'health-fitness-yoga', 'health-fitness', NULL, 'Йога', 2);
SELECT insert_category('Пилатес', 'health-fitness-pilates', 'health-fitness', NULL, 'Пилатес', 3);
SELECT insert_category('Растяжка', 'health-fitness-stretching', 'health-fitness', NULL, 'Растяжка', 4);
SELECT insert_category('SPA', 'health-spa', 'health', NULL, 'SPA процедуры', 3);
SELECT insert_category('Баня', 'health-banya', 'health', NULL, 'Баня', 4);
SELECT insert_category('Сауна', 'health-sauna', 'health', NULL, 'Сауна', 5);

-- ============ ДОМ И БЫТ ============
SELECT insert_category('Дом и быт', 'home', NULL, '🏠', 'Услуги для дома и быта', 3);
SELECT insert_category('Уборка', 'home-cleaning', 'home', NULL, 'Уборка помещений', 1);
SELECT insert_category('Генеральная', 'home-cleaning-general', 'home-cleaning', NULL, 'Генеральная уборка', 1);
SELECT insert_category('Поддерживающая', 'home-cleaning-regular', 'home-cleaning', NULL, 'Поддерживающая уборка', 2);
SELECT insert_category('После ремонта', 'home-cleaning-after-renovation', 'home-cleaning', NULL, 'Уборка после ремонта', 3);
SELECT insert_category('Окон', 'home-cleaning-windows', 'home-cleaning', NULL, 'Мытье окон', 4);
SELECT insert_category('Ремонт', 'home-repair', 'home', NULL, 'Ремонтные работы', 2);
SELECT insert_category('Электрик', 'home-repair-electrician', 'home-repair', NULL, 'Электромонтаж', 1);
SELECT insert_category('Сантехник', 'home-repair-plumber', 'home-repair', NULL, 'Сантехнические работы', 2);
SELECT insert_category('Отделочник', 'home-repair-finisher', 'home-repair', NULL, 'Отделочные работы', 3);
SELECT insert_category('Маляр', 'home-repair-painter', 'home-repair', NULL, 'Малярные работы', 4);
SELECT insert_category('Плиточник', 'home-repair-tiler', 'home-repair', NULL, 'Укладка плитки', 5);
SELECT insert_category('Плотник', 'home-repair-carpenter', 'home-repair', NULL, 'Плотницкие работы', 6);
SELECT insert_category('Монтажник', 'home-repair-installer', 'home-repair', NULL, 'Монтажные работы', 7);
SELECT insert_category('Мебель', 'home-furniture', 'home', NULL, 'Мебельные услуги', 3);
SELECT insert_category('Климат', 'home-climate', 'home', NULL, 'Климатическое оборудование', 4);
SELECT insert_category('Бытовые услуги', 'home-household', 'home', NULL, 'Бытовые услуги', 5);

-- ============ АВТО ============
SELECT insert_category('Авто', 'auto', NULL, '🚗', 'Автомобильные услуги', 4);
SELECT insert_category('Ремонт', 'auto-repair', 'auto', NULL, 'Ремонт автомобилей', 1);
SELECT insert_category('Двигатель', 'auto-repair-engine', 'auto-repair', NULL, 'Ремонт двигателя', 1);
SELECT insert_category('Ходовая', 'auto-repair-suspension', 'auto-repair', NULL, 'Ремонт ходовой', 2);
SELECT insert_category('Электрика', 'auto-repair-electrical', 'auto-repair', NULL, 'Автоэлектрика', 3);
SELECT insert_category('Диагностика', 'auto-repair-diagnostics', 'auto-repair', NULL, 'Диагностика', 4);
SELECT insert_category('Кузов', 'auto-body', 'auto', NULL, 'Кузовные работы', 2);
SELECT insert_category('Покраска', 'auto-body-painting', 'auto-body', NULL, 'Покраска', 1);
SELECT insert_category('Рихтовка', 'auto-body-straightening', 'auto-body', NULL, 'Рихтовка', 2);
SELECT insert_category('Полировка', 'auto-body-polishing', 'auto-body', NULL, 'Полировка', 3);
SELECT insert_category('Детейлинг', 'auto-body-detailing', 'auto-body', NULL, 'Детейлинг', 4);
SELECT insert_category('Шины', 'auto-tires', 'auto', NULL, 'Шиномонтаж', 3);
SELECT insert_category('Шиномонтаж', 'auto-tires-mounting', 'auto-tires', NULL, 'Шиномонтаж', 1);
SELECT insert_category('Балансировка', 'auto-tires-balancing', 'auto-tires', NULL, 'Балансировка', 2);
SELECT insert_category('Мойка', 'auto-wash', 'auto', NULL, 'Мойка автомобилей', 4);
SELECT insert_category('Эвакуатор', 'auto-tow', 'auto', NULL, 'Эвакуатор', 5);

-- ============ ФОТО И ВИДЕО ============
SELECT insert_category('Фото и видео', 'media', NULL, '📸', 'Фото и видео услуги', 5);
SELECT insert_category('Фотограф', 'media-photographer', 'media', NULL, 'Фотосъемка', 1);
SELECT insert_category('Портрет', 'media-photographer-portrait', 'media-photographer', NULL, 'Портретная съемка', 1);
SELECT insert_category('Семейная', 'media-photographer-family', 'media-photographer', NULL, 'Семейная съемка', 2);
SELECT insert_category('Свадебная', 'media-photographer-wedding', 'media-photographer', NULL, 'Свадебная съемка', 3);
SELECT insert_category('Детская', 'media-photographer-kids', 'media-photographer', NULL, 'Детская съемка', 4);
SELECT insert_category('Предметная', 'media-photographer-product', 'media-photographer', NULL, 'Предметная съемка', 5);
SELECT insert_category('Видеограф', 'media-videographer', 'media', NULL, 'Видеосъемка', 2);
SELECT insert_category('Видеомонтаж', 'media-editing', 'media', NULL, 'Видеомонтаж', 3);
SELECT insert_category('Фоторетушь', 'media-retouching', 'media', NULL, 'Ретушь фотографий', 4);
SELECT insert_category('Студии', 'media-studios', 'media', NULL, 'Фотостудии', 5);

-- ============ ОБУЧЕНИЕ ============
SELECT insert_category('Обучение', 'education', NULL, '📚', 'Образовательные услуги', 6);
SELECT insert_category('Школьные предметы', 'education-school', 'education', NULL, 'Школьные предметы', 1);
SELECT insert_category('Математика', 'education-school-math', 'education-school', NULL, 'Математика', 1);
SELECT insert_category('Русский язык', 'education-school-russian', 'education-school', NULL, 'Русский язык', 2);
SELECT insert_category('Физика', 'education-school-physics', 'education-school', NULL, 'Физика', 3);
SELECT insert_category('Химия', 'education-school-chemistry', 'education-school', NULL, 'Химия', 4);
SELECT insert_category('Иностранные языки', 'education-school-languages', 'education-school', NULL, 'Иностранные языки', 5);
SELECT insert_category('Языки', 'education-languages', 'education', NULL, 'Иностранные языки', 2);
SELECT insert_category('Профессиональное обучение', 'education-professional', 'education', NULL, 'Профессиональное обучение', 3);
SELECT insert_category('Программирование', 'education-programming', 'education', NULL, 'Программирование', 4);
SELECT insert_category('Музыка', 'education-music', 'education', NULL, 'Музыка', 5);
SELECT insert_category('Вокал', 'education-vocal', 'education', NULL, 'Вокал', 6);
SELECT insert_category('Рисование', 'education-drawing', 'education', NULL, 'Рисование', 7);
SELECT insert_category('3D-моделирование', 'education-3d', 'education', NULL, '3D-моделирование', 8);

-- ============ IT И ЦИФРОВЫЕ УСЛУГИ ============
SELECT insert_category('IT и цифровые услуги', 'it', NULL, '💻', 'IT и цифровые услуги', 7);
SELECT insert_category('Разработка', 'it-development', 'it', NULL, 'Разработка', 1);
SELECT insert_category('Сайты', 'it-development-websites', 'it-development', NULL, 'Разработка сайтов', 1);
SELECT insert_category('Интернет-магазины', 'it-development-stores', 'it-development', NULL, 'Интернет-магазины', 2);
SELECT insert_category('Приложения', 'it-development-apps', 'it-development', NULL, 'Мобильные приложения', 3);
SELECT insert_category('Боты', 'it-development-bots', 'it-development', NULL, 'Чат-боты', 4);
SELECT insert_category('Дизайн', 'it-design', 'it', NULL, 'Дизайн', 2);
SELECT insert_category('UI/UX', 'it-design-uiux', 'it-design', NULL, 'UI/UX дизайн', 1);
SELECT insert_category('Логотипы', 'it-design-logos', 'it-design', NULL, 'Разработка логотипов', 2);
SELECT insert_category('Баннеры', 'it-design-banners', 'it-design', NULL, 'Баннеры', 3);
SELECT insert_category('3D', 'it-design-3d', 'it-design', NULL, '3D дизайн', 4);
SELECT insert_category('Маркетинг', 'it-marketing', 'it', NULL, 'Маркетинг', 3);
SELECT insert_category('SEO', 'it-marketing-seo', 'it-marketing', NULL, 'SEO продвижение', 1);
SELECT insert_category('SMM', 'it-marketing-smm', 'it-marketing', NULL, 'SMM', 2);
SELECT insert_category('Контент', 'it-marketing-content', 'it-marketing', NULL, 'Контент-маркетинг', 3);
SELECT insert_category('Реклама', 'it-marketing-ads', 'it-marketing', NULL, 'Реклама', 4);
SELECT insert_category('Техническая помощь', 'it-support', 'it', NULL, 'Техническая помощь', 4);

-- ============ ДОСТАВКА И ЛОГИСТИКА ============
SELECT insert_category('Доставка и логистика', 'delivery', NULL, '🚚', 'Доставка и логистика', 8);
SELECT insert_category('Курьеры', 'delivery-couriers', 'delivery', NULL, 'Курьерские услуги', 1);
SELECT insert_category('Грузоперевозки', 'delivery-cargo', 'delivery', NULL, 'Грузоперевозки', 2);
SELECT insert_category('Переезды', 'delivery-moving', 'delivery', NULL, 'Переезды', 3);
SELECT insert_category('Доставка', 'delivery-delivery', 'delivery', NULL, 'Доставка', 4);
SELECT insert_category('Такси', 'delivery-taxi', 'delivery', NULL, 'Такси', 5);
SELECT insert_category('Спецтехника', 'delivery-special', 'delivery', NULL, 'Спецтехника', 6);

-- ============ МЕРОПРИЯТИЯ ============
SELECT insert_category('Мероприятия', 'events', NULL, '🎉', 'Организация мероприятий', 9);
SELECT insert_category('Ведущие', 'events-hosts', 'events', NULL, 'Ведущие мероприятий', 1);
SELECT insert_category('Музыканты', 'events-musicians', 'events', NULL, 'Музыканты', 2);
SELECT insert_category('DJ', 'events-dj', 'events', NULL, 'DJ', 3);
SELECT insert_category('Аниматоры', 'events-animators', 'events', NULL, 'Аниматоры', 4);
SELECT insert_category('Декораторы', 'events-decorators', 'events', NULL, 'Декораторы', 5);
SELECT insert_category('Организаторы', 'events-organizers', 'events', NULL, 'Организаторы', 6);
SELECT insert_category('Флористы', 'events-florists', 'events', NULL, 'Флористы', 7);
SELECT insert_category('Кейтеринг', 'events-catering', 'events', NULL, 'Кейтеринг', 8);
SELECT insert_category('Фото / видео', 'events-photo-video', 'events', NULL, 'Фото и видео на мероприятиях', 9);

-- ============ ТВОРЧЕСТВО ============
SELECT insert_category('Творчество', 'creative', NULL, '🎨', 'Творческие услуги', 10);
SELECT insert_category('Музыканты', 'creative-musicians', 'creative', NULL, 'Музыканты', 1);
SELECT insert_category('Группы', 'creative-bands', 'creative', NULL, 'Музыкальные группы', 2);
SELECT insert_category('Вокалисты', 'creative-vocalists', 'creative', NULL, 'Вокалисты', 3);
SELECT insert_category('DJ', 'creative-dj', 'creative', NULL, 'DJ', 4);
SELECT insert_category('Аранжировщики', 'creative-arrangers', 'creative', NULL, 'Аранжировщики', 5);
SELECT insert_category('Звукорежиссёры', 'creative-sound', 'creative', NULL, 'Звукорежиссёры', 6);
SELECT insert_category('Продюсеры', 'creative-producers', 'creative', NULL, 'Продюсеры', 7);

-- ============ ЖИВОТНЫЕ ============
SELECT insert_category('Животные', 'pets', NULL, '🐾', 'Услуги для животных', 11);
SELECT insert_category('Ветеринарные услуги', 'pets-veterinary', 'pets', NULL, 'Ветеринарные услуги', 1);
SELECT insert_category('Груминг', 'pets-grooming', 'pets', NULL, 'Груминг', 2);
SELECT insert_category('Передержка', 'pets-boarding', 'pets', NULL, 'Передержка', 3);
SELECT insert_category('Выгул', 'pets-walking', 'pets', NULL, 'Выгул', 4);
SELECT insert_category('Дрессировка', 'pets-training', 'pets', NULL, 'Дрессировка', 5);
SELECT insert_category('Зооняни', 'pets-sitting', 'pets', NULL, 'Зооняни', 6);

-- ============ ДЕТИ ============
SELECT insert_category('Дети', 'kids', NULL, '👶', 'Услуги для детей', 12);
SELECT insert_category('Няни', 'kids-nannies', 'kids', NULL, 'Няни', 1);
SELECT insert_category('Репетиторы', 'kids-tutors', 'kids', NULL, 'Репетиторы', 2);
SELECT insert_category('Аниматоры', 'kids-animators', 'kids', NULL, 'Аниматоры', 3);
SELECT insert_category('Детские тренеры', 'kids-trainers', 'kids', NULL, 'Детские тренеры', 4);
SELECT insert_category('Развивающие занятия', 'kids-development', 'kids', NULL, 'Развивающие занятия', 5);
SELECT insert_category('Детские фотографы', 'kids-photographers', 'kids', NULL, 'Детские фотографы', 6);

-- ============ ОДЕЖДА И СТИЛЬ ============
SELECT insert_category('Одежда и стиль', 'fashion', NULL, '👗', 'Услуги для одежды и стиля', 13);
SELECT insert_category('Портные', 'fashion-tailors', 'fashion', NULL, 'Портные', 1);
SELECT insert_category('Ателье', 'fashion-atelier', 'fashion', NULL, 'Ателье', 2);
SELECT insert_category('Ремонт одежды', 'fashion-repair', 'fashion', NULL, 'Ремонт одежды', 3);
SELECT insert_category('Швеи', 'fashion-seamstresses', 'fashion', NULL, 'Швеи', 4);
SELECT insert_category('Стилист', 'fashion-stylist', 'fashion', NULL, 'Стилист', 5);
SELECT insert_category('Имиджмейкер', 'fashion-image', 'fashion', NULL, 'Имиджмейкер', 6);

-- ============ ПРОИЗВОДСТВО ============
SELECT insert_category('Производство', 'production', NULL, '🏭', 'Производственные услуги', 14);
SELECT insert_category('3D-печать', 'production-3d', 'production', NULL, '3D-печать', 1);
SELECT insert_category('Лазерная резка', 'production-laser', 'production', NULL, 'Лазерная резка', 2);
SELECT insert_category('ЧПУ', 'production-cnc', 'production', NULL, 'ЧПУ обработка', 3);
SELECT insert_category('Сварка', 'production-welding', 'production', NULL, 'Сварка', 4);
SELECT insert_category('Металлообработка', 'production-metal', 'production', NULL, 'Металлообработка', 5);
SELECT insert_category('Деревообработка', 'production-wood', 'production', NULL, 'Деревообработка', 6);
SELECT insert_category('Мебель', 'production-furniture', 'production', NULL, 'Производство мебели', 7);
SELECT insert_category('Изготовление на заказ', 'production-custom', 'production', NULL, 'Изготовление на заказ', 8);

-- ============ САД И УЧАСТОК ============
SELECT insert_category('Сад и участок', 'garden', NULL, '🌳', 'Услуги для сада и участка', 15);
SELECT insert_category('Ландшафтный дизайн', 'garden-landscape', 'garden', NULL, 'Ландшафтный дизайн', 1);
SELECT insert_category('Озеленение', 'garden-greening', 'garden', NULL, 'Озеленение', 2);
SELECT insert_category('Покос травы', 'garden-mowing', 'garden', NULL, 'Покос травы', 3);
SELECT insert_category('Обрезка деревьев', 'garden-trimming', 'garden', NULL, 'Обрезка деревьев', 4);
SELECT insert_category('Уборка участка', 'garden-cleaning', 'garden', NULL, 'Уборка участка', 5);
SELECT insert_category('Строительство', 'garden-construction', 'garden', NULL, 'Строительство', 6);

-- ============ СТРОИТЕЛЬСТВО ============
SELECT insert_category('Строительство', 'construction', NULL, '🏗', 'Строительные услуги', 16);
SELECT insert_category('Проектирование', 'construction-design', 'construction', NULL, 'Проектирование', 1);
SELECT insert_category('Фундамент', 'construction-foundation', 'construction', NULL, 'Фундамент', 2);
SELECT insert_category('Кровля', 'construction-roofing', 'construction', NULL, 'Кровля', 3);
SELECT insert_category('Фасады', 'construction-facades', 'construction', NULL, 'Фасады', 4);
SELECT insert_category('Электрика', 'construction-electrical', 'construction', NULL, 'Электрика', 5);
SELECT insert_category('Сантехника', 'construction-plumbing', 'construction', NULL, 'Сантехника', 6);
SELECT insert_category('Отделка', 'construction-finishing', 'construction', NULL, 'Отделка', 7);
SELECT insert_category('Монтаж', 'construction-installation', 'construction', NULL, 'Монтаж', 8);

-- ============ БИЗНЕС-УСЛУГИ ============
SELECT insert_category('Бизнес-услуги', 'business', NULL, '💼', 'Бизнес-услуги', 17);
SELECT insert_category('Бухгалтер', 'business-accounting', 'business', NULL, 'Бухгалтерские услуги', 1);
SELECT insert_category('Юрист', 'business-legal', 'business', NULL, 'Юридические услуги', 2);
SELECT insert_category('Консультант', 'business-consulting', 'business', NULL, 'Консалтинг', 3);
SELECT insert_category('HR', 'business-hr', 'business', NULL, 'HR услуги', 4);
SELECT insert_category('Маркетолог', 'business-marketing', 'business', NULL, 'Маркетинг', 5);
SELECT insert_category('Продажи', 'business-sales', 'business', NULL, 'Продажи', 6);
SELECT insert_category('Аудит', 'business-audit', 'business', NULL, 'Аудит', 7);
SELECT insert_category('Документы', 'business-documents', 'business', NULL, 'Работа с документами', 8);

-- ============ ДОКУМЕНТЫ И ПОМОЩЬ ============
SELECT insert_category('Документы и помощь', 'documents', NULL, '📄', 'Работа с документами', 18);
SELECT insert_category('Переводы', 'documents-translation', 'documents', NULL, 'Переводы', 1);
SELECT insert_category('Заполнение документов', 'documents-filling', 'documents', NULL, 'Заполнение документов', 2);
SELECT insert_category('Копирайтинг', 'documents-copywriting', 'documents', NULL, 'Копирайтинг', 3);
SELECT insert_category('Редактура', 'documents-editing', 'documents', NULL, 'Редактура', 4);
SELECT insert_category('Расшифровка аудио', 'documents-transcription', 'documents', NULL, 'Расшифровка аудио', 5);

COMMIT;

-- Drop helper function
DROP FUNCTION insert_category;
