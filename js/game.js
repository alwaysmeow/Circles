var board = document.getElementById('Board');
var click_board = document.getElementById('ClickBoard');
var score_field = document.getElementById('Score');
var Score = 0;
var BestScore = 0;
var GameOver = false;
var UpdateInterval;

class Vector
{
  constructor(ConstructBy, Parameter1, Parameter2)
  {
    if (ConstructBy == "dl")
    {
      this.x = Math.sin(Parameter1) * Parameter2;
      this.y = Math.cos(Parameter1) * Parameter2;
      this.Direction = Parameter1; // 0 - вниз, пи / 2 - вправо
      this.Length = Parameter2;
    }
    else if (ConstructBy == "xy")
    {
      this.x = Parameter1;
      this.y = Parameter2;

      if (Parameter1 >= 0)
        if (Parameter2 == 0)
          this.Direction = Math.PI / 2;
        else if (Parameter2 > 0)
          this.Direction = Math.atan(Parameter1 / Parameter2);
        else
          this.Direction = Math.atan(Parameter1 / Parameter2) + Math.PI;
      else
        if (Parameter2 == 0)
          this.Direction = 3 * Math.PI / 2;
        else if (Parameter2 > 0)
          this.Direction = Math.atan(Parameter1 / Parameter2) + 2 * Math.PI;
        else
          this.Direction = Math.atan(Parameter1 / Parameter2) + Math.PI;

      this.Length = Math.sqrt(Math.pow(Parameter1, 2) + Math.pow(Parameter2, 2));
    }
    else
      console.log("Invalid constructor parameter: ConstructBy");
  }

  Extend(Multiplier)
  {
    this.x *= Multiplier;
    this.y *= Multiplier;
    if (Multiplier < 0)
    {
      Multiplier *= -1;
      this.Direction += Math.PI;
    }
    this.Length *= Multiplier;
  }
}

function ScalarProduct(v1, v2)
{
  return (v1.x * v2.x) + (v1.y * v2.y);
}

function Sum(v1, v2)
{
  return new Vector("xy", v1.x + v2.x, v1.y + v2.y);
}

const Bounce = {
  Wall: "wall",
  Other: "other",
  None: ""
}

const CircleType = {
  Neutral: "neutral",
  Mad: "mad",
  Happy: "happy"
}

class Circle
{
  static Amount = 0;
  static List = [];
  static Radius = (window.innerWidth + window.innerHeight) * 1.5 / 100;
  static MaxAmount = 10;
  static BouncesToGetMad = 3;
  static BouncesToGetHappy = 3;

  constructor(x, y)
  {
    this.index = Circle.Amount;
    this.Killed = false;
    Circle.Amount++;
    Circle.List.push(this);
    this.x = x;
    this.y = y;
    this.OutXRange = false;
    this.OutYRange = false;
    this.Type = CircleType.Neutral;
    this.SameBouncesInARow = 0;
    this.LastBounce = Bounce.None;
    this.Vector = new Vector("dl", Math.random() * 2 * Math.PI, 1)
    this.CollisionData = new Array(Circle.Amount);

    for (var i = 0; i < Circle.Amount; i++)
      this.CollisionData[i] = false;
    Circle.List.forEach((item, i) => {
      if (i != this.index)
        item.CollisionData.push(false);
    });

    this.object = document.createElement('div');
    this.object.className = "Circle";
    this.object.id = this.index;
    this.ObjectUpdate();
    board.append(this.object);
  }

  Kill()
  {
    this.Killed = true;
    this.object.style.setProperty("padding", "0px");
    this.object.style.setProperty("margin", Circle.Radius + "px");
    //this.object.parentNode.removeChild(this.object);
  }

  WallUpdate()
  {
    if (this.x <= 0 || this.x >= window.innerWidth - 4 * Circle.Radius - 10)
    {
      if (!this.OutXRange)
      {
        this.Vector.Direction = 2 * Math.PI - this.Vector.Direction;
        this.Vector.x = (-1) * this.Vector.x;
        this.OutXRange = true;

        if (!GameOver)
        {
          if (this.Type != CircleType.Mad)
            AddScore();
          if (this.Type == CircleType.Neutral)
          {
            if (this.LastBounce == Bounce.Wall)
              this.SameBouncesInARow++;
            else
              this.SameBouncesInARow = 1;
            this.LastBounce = Bounce.Wall;
            if (this.SameBouncesInARow >= Circle.BouncesToGetMad)
            {
              this.Type = CircleType.Mad;
              this.ColorUpdate();
            }
          }
        }
      }
    }
    else
      this.OutXRange = false;

    if (this.y <= 0 || this.y >= window.innerHeight - 4 * Circle.Radius)
    {
      if (!this.OutYRange)
      {
        this.Vector.Direction = Math.PI - this.Vector.Direction;
        this.Vector.y = (-1) * this.Vector.y;
        this.OutYRange = true;

        if (!GameOver)
        {
          if (this.Type != CircleType.Mad)
            AddScore();
          if (this.Type == CircleType.Neutral)
          {
            if (this.LastBounce == Bounce.Wall)
              this.SameBouncesInARow++;
            else
              this.SameBouncesInARow = 1;
            this.LastBounce = Bounce.Wall;
            if (this.SameBouncesInARow >= Circle.BouncesToGetMad)
            {
              this.Type = CircleType.Mad;
              this.ColorUpdate();
            }
          }
        }
      }
    }
    else
      this.OutYRange = false;
  }

  static CollisionUpdate()
  {
    for (var i = 0; i < Circle.Amount - 1; i++)
      if (!Circle.List[i].Killed)
        for (var j = i + 1; j < Circle.Amount && !Circle.List[i].Killed; j++)
          if (!Circle.List[j].Killed)
          {
            if (CheckBounce(Circle.List[i], Circle.List[j]))
              if (!Circle.List[j].CollisionData[i])
              {
                if (!GameOver)
                {
                  if (Circle.List[i].LastBounce == Bounce.Other)
                    Circle.List[i].SameBouncesInARow++;
                  else
                  {
                    Circle.List[i].SameBouncesInARow = 1;
                    Circle.List[i].LastBounce = Bounce.Other;
                  }
                  if (Circle.List[j].LastBounce == Bounce.Other)
                    Circle.List[j].SameBouncesInARow++;
                  else
                  {
                    Circle.List[j].SameBouncesInARow = 1;
                    Circle.List[j].LastBounce = Bounce.Other;
                  }
                  ChangeTypesAfterBounce(Circle.List[i], Circle.List[j]);
                  if (!(Circle.List[i].Type == CircleType.Mad && Circle.List[i].Type == CircleType.Mad))
                    AddScore();
                }
                СhangeVectorsAfterBounce(Circle.List[i], Circle.List[j]);
              }
            else
              Circle.List[j].CollisionData[i] = false;
          }
  }

  ObjectUpdate()
  {
    this.object.style.left = this.x - Circle.Radius + 'px';
    this.object.style.top = this.y - Circle.Radius + 'px';
  }

  ColorUpdate()
  {
    switch (this.Type) {
      case CircleType.Neutral:
        this.object.style.setProperty("background", "var(--ItemColor)");
        break;
      case CircleType.Mad:
        this.object.style.setProperty("background", "var(--MadColor)");
        break;
      case CircleType.Happy:
        this.object.style.setProperty("background", "var(--HappyColor)");
        break;
    }
  }

  Move()
  {
    this.x += this.Vector.x;
    this.y += this.Vector.y;
    this.ObjectUpdate();
  }
}

document.documentElement.style.setProperty("--radius", Circle.Radius + "px");

function AddScore()
{
  Score++;
  score_field.innerHTML = Score;
}

function CheckBounce(c1, c2)
{
  if (Math.pow((c1.x - c2.x), 2) + Math.pow((c1.y - c2.y), 2) <= Math.pow(2 * Circle.Radius, 2))
    return true;
  else
    return false;
}

function СhangeVectorsAfterBounce(FirstCircle, SecondCircle) // Не соотносится с законом сохранения импульса. Шары отскакивают, как от стенки
{
  var FirstToSecondBounceVector = new Vector("xy", (SecondCircle.x - FirstCircle.x), (SecondCircle.y - FirstCircle.y));
  var SecondToFirstBounceVector = new Vector("xy", (FirstCircle.x - SecondCircle.x), (FirstCircle.y - SecondCircle.y));
  var SecondCircleObtainment = new Vector("xy", 0, 0);
  var SecondCircleLoss = new Vector("xy", 0, 0);

  var SumOfVelo = FirstCircle.Vector.Length + SecondCircle.Vector.Length;

  if (ScalarProduct(FirstToSecondBounceVector, FirstCircle.Vector) > 0) // Если первый круг влетел во второй, то он отдал второму импульс
  {
    SecondCircleObtainment = new Vector("dl", FirstToSecondBounceVector.Direction, 1);
    SecondCircleObtainment.Extend(ScalarProduct(FirstCircle.Vector, FirstToSecondBounceVector) / FirstToSecondBounceVector.Length);
  }

  if (ScalarProduct(SecondToFirstBounceVector, SecondCircle.Vector) > 0) // Если второй круг влетел в первый, то он отдал первому импульс
  {
    SecondCircleLoss = new Vector("dl", SecondToFirstBounceVector.Direction, 1);
    SecondCircleLoss.Extend((-1) * ScalarProduct(SecondCircle.Vector, SecondToFirstBounceVector) / SecondToFirstBounceVector.Length);
    SecondCircleObtainment = Sum(SecondCircleObtainment, SecondCircleLoss);
  }

  if (!(SecondCircle.OutXRange || SecondCircle.OutYRange))
    SecondCircle.Vector = Sum(SecondCircle.Vector, SecondCircleObtainment);
  SecondCircleObtainment.Extend(-1);
  if (!(FirstCircle.OutXRange || FirstCircle.OutYRange))
    FirstCircle.Vector = Sum(FirstCircle.Vector, SecondCircleObtainment);

  var FirstVelocity = SumOfVelo * FirstCircle.Vector.Length / (FirstCircle.Vector.Length + SecondCircle.Vector.Length);
  var SecondVelocity = SumOfVelo * SecondCircle.Vector.Length / (FirstCircle.Vector.Length + SecondCircle.Vector.Length);

  FirstCircle.Vector.Extend(FirstVelocity / FirstCircle.Vector.Length);
  SecondCircle.Vector.Extend(SecondVelocity / SecondCircle.Vector.Length);
}

function ChangeTypesAfterBounce(FirstCircle, SecondCircle)
{
  if (FirstCircle.Type == CircleType.Neutral && SecondCircle.Type == CircleType.Neutral)
  { // Два нейтральных
    if (FirstCircle.SameBouncesInARow >= Circle.BouncesToGetHappy)
    {
      FirstCircle.Type = CircleType.Happy;
      FirstCircle.ColorUpdate();
      FirstCircle.SameBouncesInARow = 0;
    }
    if (SecondCircle.SameBouncesInARow >= Circle.BouncesToGetHappy)
    {
      SecondCircle.Type = CircleType.Happy;
      SecondCircle.ColorUpdate();
      SecondCircle.SameBouncesInARow = 0;
    }
  }
  else if ((FirstCircle.Type == CircleType.Mad && SecondCircle.Type == CircleType.Neutral) || (FirstCircle.Type == CircleType.Neutral && SecondCircle.Type == CircleType.Mad))
  { // Злой и нейтральный
    console.log('kill');
    FirstCircle.Kill();
    SecondCircle.Kill();
  }
  else if ((FirstCircle.Type == CircleType.Mad && SecondCircle.Type == CircleType.Happy) || (FirstCircle.Type == CircleType.Happy && SecondCircle.Type == CircleType.Mad))
  { // Злой и счастливый
    console.log('heal');
    FirstCircle.Type = CircleType.Neutral;
    SecondCircle.Type = CircleType.Neutral;
    FirstCircle.SameBouncesInARow = 0;
    SecondCircle.SameBouncesInARow = 0;
    FirstCircle.ColorUpdate();
    SecondCircle.ColorUpdate();
  }
  else
  {
    if (FirstCircle.SameBouncesInARow >= Circle.BouncesToGetHappy && FirstCircle.Type == CircleType.Neutral)
    {
      FirstCircle.Type = CircleType.Happy;
      FirstCircle.ColorUpdate();
      FirstCircle.SameBouncesInARow = 0;
    }
    if (SecondCircle.SameBouncesInARow >= Circle.BouncesToGetHappy && SecondCircle.Type == CircleType.Neutral)
    {
      SecondCircle.Type = CircleType.Happy;
      SecondCircle.ColorUpdate();
      SecondCircle.SameBouncesInARow = 0;
    }
  }
}

function AddCircle(event)
{
  var isPossible = true;
  var x = event.layerX;
  var y = event.layerY;
  Circle.List.forEach((item) => {
    if (!item.Killed)
      if ((Math.pow((item.x - x), 2) + Math.pow((item.y - y), 2)) < Math.pow(2 * Circle.Radius, 2))
        isPossible = false;
  });

  if (Circle.Amount < Circle.MaxAmount && isPossible)
  {
    new Circle(x, y);
    Circle.List[Circle.Amount - 1].object.addEventListener('click', ReverseCircle);
    if (Circle.Amount == 1)
      StartGame();
  }
}
click_board.addEventListener('click', AddCircle);

function ReverseCircle()
{
  console.log('reverse');
  Circle.List[this.id].Vector.Extend(-1);
}

function StartGame()
{
  Score = 0;
  score_field.innerHTML = 0;
  UpdateInterval = setInterval(Update, 1);
  score_field.classList.remove("GameOver");
  GameOver = false;
}

function EndGame()
{
  score_field.innerHTML = "GAME OVER<br>" + Score;
  score_field.classList.add("GameOver");
  GameOver = true;
  if (BestScore < Score)
  {
    BestScore = Score;
    document.getElementById('Best').innerHTML = "Best Score: " + BestScore;
  }
  click_board.addEventListener('click', ClearBoard);
}

function IsEndGame()
{
  var MadAmount = 0;
  var HappyAmount = 0;
  var AliveAmount = 0;
  for (var i = 0; i < Circle.Amount; i++)
  {
    if (Circle.List[i].Type == CircleType.Mad && !Circle.List[i].Killed)
      MadAmount++;
    else if (Circle.List[i].Type == CircleType.Happy && !Circle.List[i].Killed)
      HappyAmount++;
    if (!Circle.List[i].Killed)
      AliveAmount++;
  }
  if (AliveAmount == HappyAmount || (AliveAmount == MadAmount && Circle.Amount == Circle.MaxAmount))
  {
    GameOver = true;
    return true;
  }
}

function ClearBoard()
{
  for (var i = 0; i < Circle.Amount; i++)
  {
    if (!Circle.List[i].Killed)
      Circle.List[i].Kill();
  }
  setTimeout(200);
  for (var i = 0; i < Circle.Amount; i++)
  {
    Circle.List[0].object.parentNode.removeChild(Circle.List[0].object);
    delete Circle.List[0];
    Circle.List.shift();
  }
  Circle.Amount = 0;
  clearInterval(UpdateInterval);
  this.removeEventListener('click', ClearBoard);
}

function Update()
{
  Circle.List.forEach((item) => {
    if (!item.Killed)
      item.WallUpdate();
  });
  Circle.CollisionUpdate()
  Circle.List.forEach((item) => {
    if (!item.Killed)
      item.Move();
  });
  if (IsEndGame())
    EndGame();
}

console.log("Board size:", window.innerWidth - 150, window.innerHeight - 150);
