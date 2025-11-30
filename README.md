# zoom-room-rotator
Breakout huoneiden vaihtamisen automatisointi Zoom web clientissä


## Esimerkkejä:

- Huoneiden 1-10 kiertäminen järjestyksessä vaihtaen huonetta 20 sekunnin välein:

```JavaScript
    BreakoutRoomRotator.createAndStartLinear(1, 10, 20);
```

- Siirry huoneeseen 3:

```JavaScript
    BreakouRoomRotator.join(3);
```


## TODO:

### Käyttöliittymä:
-[ ] play/pause painike, asetusten syöttäminen

### Zoom Web Client välipalikka:
-[ ] nykyisen huoneen kysyminen
-[ ] huoneiden tietojen kysyminen
-[ ] vastuu painikkeiden painamisesta???

### BreakoutRoomRotator:
-[ ] nykyiseen huoneeseen liittymisen estäminen
-[ ] huoneeseen liittymisen virheenkäsittely
-[ ] tyhjän huoneen skippaaminen
-[ ] huoneiden tietojen hakeminen
-[ ] room join confirm käsittelijän kutsu suoraan painikkeiden sijasta (onkohan edes mahdollista)???

### Ajastin:
-[ ] ajastettujen tehtävien tunnisteet ja hienojakoisempi hallinta esim. tietyn tehtävän pysäyttäminen/jatkaminen
-[ ] tehtävän coundown loki

### Clicker:
-[ ] ei toimi vielä elementeille, jotka ovat valmiiksi DOM-puussa
