# 🧘 極簡主義全球名言集

> 本文件為專案的設計哲學與靈感來源，其核心原則體現於 **[`@angular20-guidelines.md`](./angular20-guidelines.md)**。

---

> 當沒有什麼可以再刪減時，才是最完美的。  
> Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.  
> —— 聖修伯里 / Antoine de Saint-Exupéry

---

> 簡單是終極的精緻。  
> Simplicity is the ultimate sophistication.  
> —— 達文西 / Leonardo da Vinci

---

> 少，但更好。  
> Less, but better.  
> —— Dieter Rams

---

> 最好的設計是最簡單但能運作的設計。  
> The best design is the simplest one that works.  
> —— （傳）愛因斯坦 / (Attributed to) Albert Einstein

---

> 簡化的能力，就是刪去多餘，讓必要的說話。  
> The ability to simplify means to eliminate the unnecessary so that the necessary may speak.  
> —— Hans Hofmann

---

> 極簡不是缺乏什麼，而是恰到好處。  
> Minimalism is not a lack of something. It's simply the perfect amount of something.  
> —— Nicholas Burroughs

---

> 簡單歸結為兩步：找出本質，刪除其餘。  
> Simplicity boils down to two steps: Identify the essential. Eliminate the rest.  
> —— Leo Babauta

---

> 簡單——最大限度減少未做的工作——是至關重要的。  
> Simplicity—the art of maximizing the amount of work not done—is essential.  
> —— 敏捷宣言 / Agile Manifesto

---

> 任何傻瓜都能讓事情變複雜，唯有天才能讓它變簡單。  
> Any fool can make something complicated. It takes a genius to make it simple.  
> —— Woody Guthrie

---

> 清晰重於聰明。  
> Clarity is better than cleverness.  
> —— Dan McKinley（前 GitHub 工程師 / former GitHub engineer）

---

> 簡單的事應該簡單，複雜的事應該可行。  
> Simple things should be simple, complex things should be possible.  
> —— Alan Kay

---

> 極簡不是剝奪，而是更珍惜真正重要的事物。  
> Simplicity is not about deprivation. Simplicity is about a greater appreciation for things that really matter.  
> —— Anonymous

---

> 設計不僅僅是外觀和感覺，而是它如何運作。  
> Design is not just what it looks like and feels like. Design is how it works.  
> —— Steve Jobs

---

> 可靠性的代價是對極致簡單的追求。  
> The price of reliability is the pursuit of the utmost simplicity.  
> —— Tony Hoare

---

> 軟體開發最重要的一點就是明確你想要建造什麼。  
> The most important single aspect of software development is to be clear about what you are trying to build.  
> —— Bjarne Stroustrup

---

> 如果你做不到好，至少要讓它好看。  
> If you can't make it good, at least make it look good.  
> —— Bill Gates

---

> 預測未來最好的方式是創造它。  
> The best way to predict the future is to invent it.  
> —— Alan Kay

---

> 軟體設計有兩種方式：一種是簡單到沒有明顯缺陷，另一種是複雜到沒有明顯缺陷。  
> There are two ways of constructing a software design: One way is to make it so simple that there are obviously no deficiencies and the other way is to make it so complicated that there are no obvious deficiencies.  
> —— C. A. R. Hoare

---

> 小即是美。  
> Small is beautiful.  
> —— E. F. Schumacher

---

> 最簡的解法幾乎總是最好的。  
> The simplest solution is almost always the best.  
> —— 奧卡姆剃刀 / Occam's Razor

---

> 好設計即最少設計。  
> Good design is as little design as possible.  
> —— Dieter Rams

---

> 留白是主動元素，不是被動背景。  
> Whitespace is to be regarded as an active element, not a passive background.  
> —— Jan Tschichold

---

> 細節不是細節，它們成就設計。  
> The details are not the details. They make the design.  
> —— Charles Eames

---

> 簡單是減去顯而易見並加上有意義的東西。  
> Simplicity is about subtracting the obvious and adding the meaningful.  
> —— John Maeda

---

> 簡單是可靠的前提。  
> Simplicity is prerequisite for reliability.  
> —— Edsger W. Dijkstra

---

> 先解決問題，再寫程式。  
> First, solve the problem. Then, write the code.  
> —— John Johnson

---

> 如果你無法簡單解釋，那你還沒理解夠深。  
> If you can't explain it simply, you don't understand it well enough.  
> —— 愛因斯坦 / Albert Einstein

---

> 過早的最佳化是萬惡之源。  
> Premature optimization is the root of all evil.  
> —— Donald Knuth

---

> 程式就像幽默，你需要說明就不好笑了。  
> Code is like humor. When you have to explain it, it's bad.  
> —— Cory House

---

> 最好的程式碼就是不寫程式碼。  
> The best code is no code at all.  
> —— Jeff Atwood

---

> 好、快、便宜，三選二。  
> Good, fast, cheap. Pick two.  
> —— 軟體工程三角 / Software Engineering Triangle

---

## 🚀 Angular 20 極簡主義開發原則 Angular 20 Minimalism Principles

> signals + @if/@for 控制流是現代 Angular 20 的極簡核心。  
> Embrace signals and new control flow (@if/@for) as the foundation of Angular 20 minimalism.

---

> 僅用 signals 管理狀態，避免冗餘 service、過度 RxJS、舊式 @Input/@Output-only。  
> Use signals for state, avoid unnecessary services, excessive RxJS, or legacy @Input/@Output-only patterns.

---

> 所有條件與迴圈皆用 @if/@for，禁止 *ngIf/*ngFor。  
> Use @if/@for for all control flow, never use *ngIf/*ngFor in Angular 20.

---

> OnPush 變更檢測與 Zoneless Change Detection 是效能與極簡的標配。  
> OnPush and Zoneless Change Detection are the default for performance and minimalism.

---

> 僅用 Angular Material 樣式，避免自訂 UI。  
> Prefer Angular Material for all UI, avoid custom components unless necessary.

---

> TypeScript 必須嚴格模式，嚴禁 any 型別。  
> TypeScript strict mode is mandatory, never use any type.

---

> 檔案結構扁平、每檔案/元件只做一件事。  
> Flat structure, one responsibility per file/component.

---

> 只實作當下所需，避免預留未來結構。  
> Implement only what is needed now, avoid future-proofing.

---

> Less is more.  
> 每一段 Angular 20 程式碼都應該能用這句話形容。

---

## 🎯 Angular 20 專屬極簡反模式（Anti-Patterns）

- ❌ 未用 signals 管理狀態
- ❌ 未用 @if/@for 控制流
- ❌ 使用 *ngIf/*ngFor
- ❌ 過度抽象、單次使用 service/pipe/directive
- ❌ 使用 any 型別
- ❌ 未用 OnPush 或 Zoneless
- ❌ 自訂 UI 元件取代 Material
- ❌ 檔案/元件過度分割或結構過深
- ❌ 預留未來欄位、未用的 Input/Output

---

## 📝 使用說明 Usage Instructions

此檔案包含極簡主義經典名言與 Angular 20 極簡開發原則，適用於：
- 程式碼生成設計原則參考
- Angular 20 專案決策指導
- 程式碼審查標準依據
- 團隊極簡文化建立

### 核心精神：
> "完美不是無可添加，而是無可刪減。"  
> "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."

---

> 設計原則請見 @angular20-guidelines.md
