class Theme
{
  constructor(name, bg_color, item_color, spare_color, mad_color, happy_color)
  {
    if (bg_color == item_color || item_color == spare_color || bg_color == spare_color)
    {
      console.error('Неверно задана цветовая тема.');
    }
    this.name = name;
    this.bg_color = bg_color;
    this.item_color = item_color;
    this.spare_color = spare_color;
    this.mad_color = mad_color;
    this.happy_color = happy_color;
  }

  set()
  {
    document.documentElement.style.setProperty('--BGColor', this.bg_color);
    document.documentElement.style.setProperty('--ItemColor', this.item_color);
    document.documentElement.style.setProperty('--SpareColor', this.spare_color);
    document.documentElement.style.setProperty('--MadColor', this.mad_color);
    document.documentElement.style.setProperty('--HappyColor', this.happy_color);

  }
}

class ThemeButton
{
  constructor(Theme)
  {
    this.theme = Theme;
    this.object = document.createElement('div');
    this.object.className = "Theme";
    this.object.id = this.theme.name;
    this.object.style.setProperty("--MainColor", this.theme.bg_color);
    this.object.style.setProperty("--HoverColor", this.theme.spare_color);
    this.back = document.createElement('div');
    this.face = document.createElement('div');
    this.back.className = "Back";
    this.face.className = "Face";

    this.object.append(this.back);
    this.object.append(this.face);
  }
  set()
  {
    this.theme.set();
    this.object.classList.add('active');
  }
}

var Themes = [
                new ThemeButton(new Theme("Dark", "#2D2E32", "#E5E5E5", "#37383C", "#EE6D6D", "#7EA3F1")),
                new ThemeButton(new Theme("Light", "#E9E5DD", "#1F1E1D", "#F8F3EA", "#EE6D6D", "#7EA3F1")),
                new ThemeButton(new Theme("Red", "#F48D8D", "#FEF1F1", "#F7AAAA", "#EE6D6D", "#7EA3F1")),
                new ThemeButton(new Theme("Green", "#CAF0C1", "#333C30", "#B7D4B1", "#EE6D6D", "#7EA3F1")),
                new ThemeButton(new Theme("Blue", "#CCDAF9", "#33373E", "#C2CFEA", "#EE6D6D", "#7EA3F1"))
              ];

ActiveTheme = 0;
Themes[0].set();

var list = document.getElementById('ThemesList');
for (var i = 0; i < Themes.length; i++)
{
  list.append(Themes[i].object);
}

function ChangeTheme()
{
  Themes[ActiveTheme].object.classList.remove('active');
  Themes[ActiveTheme].object.addEventListener('click', ChangeTheme);

  this.classList.add('active');
  this.removeEventListener('click', ChangeTheme);

  var i = 0;
  while (Themes[i].theme.name != this.id)
    i++;
  ActiveTheme = i;
  Themes[i].set();
}

Themes.forEach((item, i) => {
  if (i != ActiveTheme)
  {
    item.object.addEventListener('click', ChangeTheme);
  }
});
