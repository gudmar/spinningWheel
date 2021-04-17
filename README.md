# spinningWheel

Reusable custom web component communicatig with environment with attributes. Still under developement.
Full description will be finished as soon as this is finished.


## File list:
### colorGenerator.js
This class generates a array of color objects {fg:rgb, bg:rgb} with colors calculated for background and foreground. This colors will not repeat, will contrast. FOreground will be visible on background. 50 colors may be chosen, If seed is set to more then 50 colors, there is an error telling, that more colors will not be distinguishable.
### testStatisticsSpinningWheel
This is a specialy prepared spinningWheel component for statistical testing. It runs without animations, so is faster. Can be spinned many times in short period, just to see if spinning algoritm gives evenly different indexes
### countWinningStatistics.js
This component is used to test testStatisticSp9inningWheel. It runs virtual (not added to DOM) spinning wheel a number of times and reports how many times each index was chosen. This component may be put inside a modal
