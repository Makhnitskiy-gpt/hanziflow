import type { ReactNode } from 'react';

const content: Record<string, ReactNode> = {
  tones: (
    <div className="text-sm text-rice-muted leading-relaxed flex flex-col gap-3">
      <p>
        В китайском 4 основных тона + нейтральный. Тон меняет значение слова полностью:
        <strong className="text-rice"> mā</strong> (мама),
        <strong className="text-rice"> má</strong> (конопля),
        <strong className="text-rice"> mǎ</strong> (лошадь),
        <strong className="text-rice"> mà</strong> (ругать).
      </p>
      <ul className="list-none flex flex-col gap-2">
        <li><strong className="text-gold">1-й тон (ˉ)</strong> — высокий ровный. Как врач просит сказать «а-а-а».</li>
        <li><strong className="text-gold">2-й тон (ˊ)</strong> — восходящий. Как вопрос «Да?» — голос снизу вверх.</li>
        <li><strong className="text-gold">3-й тон (ˇ)</strong> — нисходяще-восходящий. Как удивлённое «Ничего себе...»</li>
        <li><strong className="text-gold">4-й тон (ˋ)</strong> — резко нисходящий. Как команда «Нет!» или «Стой!»</li>
        <li><strong className="text-gold">Нейтральный</strong> — короткий, безударный. Как безударный слог в русском.</li>
      </ul>
      <p>
        <strong className="text-rice">Ключевое отличие:</strong> в русском интонация выражает эмоцию
        (вопрос, удивление), в китайском тон — часть слова, как согласная или гласная.
      </p>
      <div className="mt-1 p-3 rounded-lg bg-ink-elevated border border-ink-border">
        <p className="text-xs text-jade font-medium mb-1.5">Правила сандхи (тоны меняются в потоке речи)</p>
        <ul className="text-xs text-rice-dim flex flex-col gap-1">
          <li>3+3 &rarr; 2+3: 你好 nǐhǎo &rarr; [níhǎo]</li>
          <li>不 (bù) перед 4-м тоном &rarr; bú: 不是 &rarr; [búshì]</li>
          <li>一 (yī) &rarr; yí перед 4-м, yì перед 1/2/3-м</li>
        </ul>
      </div>
    </div>
  ),

  pinyin: (
    <div className="text-sm text-rice-muted leading-relaxed flex flex-col gap-3">
      <p>
        Пиньинь — запись китайских звуков латиницей. Каждый слог = инициаль (согласная) +
        финаль (гласная часть) + тон. Например: <strong className="text-rice">hǎo = h + ao + 3-й тон</strong>.
      </p>
      <div className="p-3 rounded-lg bg-ink-elevated border border-ink-border">
        <p className="text-xs text-jade font-medium mb-2">Главные ловушки для русскоговорящих</p>
        <ul className="text-xs text-rice-dim flex flex-col gap-1.5">
          <li><strong className="text-rice-muted">b/d/g</strong> — не звонкие «б/д/г», а глухие без придыхания</li>
          <li><strong className="text-rice-muted">j/q/x</strong> — нет аналогов в русском; язык прижат к нижним зубам, мягкие</li>
          <li><strong className="text-rice-muted">ü</strong> — после j/q/x пишется «u», но читается «ю»: ju = дзю</li>
          <li><strong className="text-rice-muted">-i после zh/ch/sh/r</strong> — не «и», а «ы» с загнутым языком: shi ≈ шы</li>
        </ul>
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs w-full">
          <thead>
            <tr className="border-b border-ink-border">
              <th className="text-left py-1.5 pr-3 text-rice-dim font-medium">Пиньинь</th>
              <th className="text-left py-1.5 pr-3 text-rice-dim font-medium">Звук</th>
              <th className="text-left py-1.5 text-rice-dim font-medium">Комментарий</th>
            </tr>
          </thead>
          <tbody className="text-rice-muted">
            <tr className="border-b border-ink-border/50"><td className="py-1 pr-3 text-gold">b, p</td><td className="py-1 pr-3">б/п</td><td className="py-1">b без придыхания, p с придыханием</td></tr>
            <tr className="border-b border-ink-border/50"><td className="py-1 pr-3 text-gold">j, q, x</td><td className="py-1 pr-3">дзь, ць, сь</td><td className="py-1">Мягкие, язык у нижних зубов</td></tr>
            <tr className="border-b border-ink-border/50"><td className="py-1 pr-3 text-gold">zh, ch, sh, r</td><td className="py-1 pr-3">чж, ч, ш, ж</td><td className="py-1">Ретрофлексные, язык назад</td></tr>
            <tr><td className="py-1 pr-3 text-gold">z, c, s</td><td className="py-1 pr-3">цз, ц, с</td><td className="py-1">z без придыхания, c с придыханием</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  ),

  radicals: (
    <div className="text-sm text-rice-muted leading-relaxed flex flex-col gap-3">
      <p>
        Радикал — базовый смысловой элемент иероглифа. Аналогия с русским: корень слова.
        Как <strong className="text-rice">«вод-»</strong> в словах «водный», «подводный», «водопровод» указывает
        на связь с водой, так радикал <strong className="text-rice">氵(вода)</strong> в иероглифах 河 (река), 海 (море), 洗 (мыть)
        указывает на связь с жидкостью.
      </p>
      <p>
        Всего <strong className="text-rice">214 классических радикалов</strong> (ключей Канси).
        Для HSK-1 достаточно знать 40-50 основных.
      </p>
      <p>
        <strong className="text-rice">Зачем они нужны:</strong> 1) угадать значение незнакомого иероглифа;
        2) искать иероглифы в словаре; 3) системное запоминание вместо зубрёжки.
      </p>
      <div className="mt-1 p-3 rounded-lg bg-ink-elevated border border-ink-border">
        <p className="text-xs text-jade font-medium mb-1.5">Радикал может менять форму</p>
        <ul className="text-xs text-rice-dim flex flex-col gap-1">
          <li>水 (вода) &rarr; 氵 (три точки слева)</li>
          <li>人 (человек) &rarr; 亻</li>
          <li>心 (сердце) &rarr; 忄</li>
        </ul>
        <p className="text-xs text-rice-dim mt-1.5">
          Как в русском: корень «вод-» в слове «влага» уже не так очевиден.
        </p>
      </div>
    </div>
  ),

  strokes: (
    <div className="text-sm text-rice-muted leading-relaxed flex flex-col gap-3">
      <p>
        Каждый иероглиф пишется в строго определённом порядке. Это не прихоть — правильный порядок
        делает почерк разборчивым, а написание быстрым. Аналогия: в русской прописи тоже есть порядок.
      </p>
      <ul className="list-none flex flex-col gap-1.5">
        <li><strong className="text-gold">1.</strong> Сверху вниз: 三 — верхняя, средняя, нижняя</li>
        <li><strong className="text-gold">2.</strong> Слева направо: 好 — сначала 女, потом 子</li>
        <li><strong className="text-gold">3.</strong> Горизонталь раньше вертикали: 十 — сначала «—», потом «|»</li>
        <li><strong className="text-gold">4.</strong> Откидная влево раньше вправо: 人</li>
        <li><strong className="text-gold">5.</strong> Внешнее раньше внутреннего: 国 — рамка, потом 玉</li>
        <li><strong className="text-gold">6.</strong> Закрывающая черта последняя: 四 — дно рамки в конце</li>
        <li><strong className="text-gold">7.</strong> Центр перед боковыми: 小</li>
      </ul>
      <p className="text-xs text-rice-dim">
        Базовых черт всего 8: горизонталь (一), вертикаль (丨), точка (丶), откидная влево (丿),
        откидная вправо (㇏), крючок (亅), излом (㇆), загиб.
      </p>
    </div>
  ),

  stroke_order: undefined as unknown as ReactNode, // alias, set below

  formation_types: (
    <div className="text-sm text-rice-muted leading-relaxed flex flex-col gap-3">
      <p>
        ~80% иероглифов — <strong className="text-rice">фоно-семантические составные</strong>: одна часть
        подсказывает значение (семантический радикал), другая — произношение (фонетик).
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-ink-elevated border border-ink-border">
          <p className="text-xs text-gold font-medium mb-1">Пиктограмма</p>
          <p className="text-xs text-rice-dim">Рисунок предмета: 日 山 水</p>
        </div>
        <div className="p-2.5 rounded-lg bg-ink-elevated border border-ink-border">
          <p className="text-xs text-gold font-medium mb-1">Идеограмма</p>
          <p className="text-xs text-rice-dim">Абстракция: 上 下 一</p>
        </div>
        <div className="p-2.5 rounded-lg bg-ink-elevated border border-ink-border">
          <p className="text-xs text-gold font-medium mb-1">Составной смысл</p>
          <p className="text-xs text-rice-dim">明 = 日(солнце) + 月(луна) = светлый</p>
        </div>
        <div className="p-2.5 rounded-lg bg-ink-elevated border border-ink-border">
          <p className="text-xs text-gold font-medium mb-1">Звук + значение</p>
          <p className="text-xs text-rice-dim">妈 = 女(жен.) + 马(mǎ звук) = мама</p>
        </div>
      </div>
      <p>
        Понимание типа помогает запоминать: если иероглиф фоно-семантический, вы знаете,
        какая часть отвечает за значение, а какая — за звук.
      </p>
    </div>
  ),

  srs: (
    <div className="text-sm text-rice-muted leading-relaxed flex flex-col gap-3">
      <p>
        SRS — система, которая показывает карточки именно тогда, когда вы их почти забыли.
        Лёгкие карточки — реже, трудные — чаще. HanziFlow использует алгоритм
        <strong className="text-rice"> FSRS-5</strong> (лучше классического Anki SM-2).
      </p>
      <div className="p-3 rounded-lg bg-ink-elevated border border-ink-border">
        <p className="text-xs text-jade font-medium mb-2">Кнопки оценки при повторении</p>
        <ul className="text-xs text-rice-dim flex flex-col gap-1.5">
          <li><strong className="text-cinnabar">Снова</strong> — не вспомнил(а). Карточка вернётся через минуты.</li>
          <li><strong className="text-gold">Трудно</strong> — вспомнил(а) с трудом. Интервал сократится.</li>
          <li><strong className="text-rice">Хорошо</strong> — вспомнил(а) нормально. Стандартный интервал.</li>
          <li><strong className="text-jade">Легко</strong> — очевидно. Интервал увеличится сильнее.</li>
        </ul>
      </div>
    </div>
  ),

  classifiers: (
    <div className="text-sm text-rice-muted leading-relaxed flex flex-col gap-3">
      <p>
        В китайском нельзя просто сказать «три книги» — нужно счётное слово:
        三<strong className="text-rice">本</strong>书 (sān <strong className="text-rice">běn</strong> shū).
        В русском такое тоже есть: «две <em>головы</em> капусты», «три <em>листа</em> бумаги».
        В китайском это обязательно для всех существительных.
      </p>
      <div className="p-3 rounded-lg bg-ink-elevated border border-ink-border">
        <p className="text-xs text-jade font-medium mb-2">Основные классификаторы</p>
        <ul className="text-xs text-rice-dim flex flex-col gap-1">
          <li><strong className="text-rice-muted">个 (gè)</strong> — универсальный, для людей и предметов</li>
          <li><strong className="text-rice-muted">本 (běn)</strong> — для книг и тетрадей</li>
          <li><strong className="text-rice-muted">杯 (bēi)</strong> — для чашек/стаканов напитков</li>
          <li><strong className="text-rice-muted">块 (kuài)</strong> — для кусков и юаней</li>
          <li><strong className="text-rice-muted">张 (zhāng)</strong> — для плоских предметов</li>
        </ul>
      </div>
      <p>
        Логика — в форме предмета: плоское (张), длинное (条), круглое (颗), скреплённое (本).
        На HSK-1 достаточно запомнить 个 как универсальный и 2-3 частых.
      </p>
    </div>
  ),

  mnemonics: (
    <div className="text-sm text-rice-muted leading-relaxed flex flex-col gap-3">
      <p>
        Рисуйте стилусом (или мышкой) ассоциации, которые помогут запомнить иероглиф.
        Рисунки сохраняются для каждого радикала и иероглифа отдельно.
      </p>
      <p>
        <strong className="text-rice">Пример:</strong> радикал 女 (женщина) — нарисуйте
        фигуру сидящей женщины. Иероглиф 好 (хороший) = 女 + 子 — женщина с ребёнком = хорошо.
      </p>
      <p className="text-xs text-rice-dim">
        Два режима: «Штрихи» (hanzi-writer проверяет правильность порядка черт) и
        «Рисование» (свободный холст для мнемоник).
      </p>
    </div>
  ),
};

// Alias: stroke_order = strokes (learning-path.json uses "strokes", ExplainerIndex uses "stroke_order")
content.stroke_order = content.strokes;

/** Get full explainer JSX content by key */
export function getExplainerContent(key: string): ReactNode {
  return content[key] ?? null;
}

/** Explainer titles mapping */
export const explainerTitles: Record<string, string> = {
  tones: 'Тоны в китайском языке',
  pinyin: 'Пиньинь — латинская транскрипция',
  radicals: 'Что такое радикалы?',
  strokes: 'Порядок штрихов',
  stroke_order: 'Порядок штрихов',
  formation_types: 'Типы построения иероглифов',
  classifiers: 'Счётные слова (классификаторы)',
  srs: 'Интервальное повторение (SRS)',
  mnemonics: 'Мнемоники — рисуй, чтобы запомнить',
};
