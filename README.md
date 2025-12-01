# zoom-room-rotator
Breakout huoneiden vaihtamisen automatisointi Zoom web clientissä


## Esimerkkejä:

Huoneiden 1-10 kiertäminen järjestyksessä vaihtaen huonetta 20 sekunnin välein:

```JavaScript
    BreakoutRoomRotator.createAndStartLinear(1, 10, 20);
```
Huoneiden kiertäminen satunnaisessa järjestyksessä (kaikissa huoneissa vieraillaan kerran ennen seuraavaa kierrosta):

```JavaScript
    BreakoutRoomRotator.createAndStartRandom(1, 10, 20);
```

Siirry huoneeseen 3:

```JavaScript
    BreakouRoomRotator.join(3);
```
