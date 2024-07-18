# Experiments and Responses

A series of small experiments for reflection in games, primarily focusing on experimental interactions in p5.js and sound design in RNBO.

### Experiment 1 // 19 Jun, 2024

It's a black circle. Touch it.

https://mouseandthebillionaire.com/reflectiveStudies/01/

When the user hovers over the black circle it begins to slowly grow in size while the audio detunes and becomes more complex.

One interesting thing about this is that the act of holding the mouse over the circle becomes easier and easier and easier as the circle grows larger (until really the user doesn't need to do anything for it to continue). This feels in line with reflective or meditative experiences. It's often harder to get going, to decide to take time away from your thoughts or activities but then once you're going it's much easier to keep going. From my perspective the act of holding the mouse on the circle does bring about a bit of a calming experience (which, it's still to be determined wether or not \[probably not\] 'calming' is even a goal) But also, this feels focusing. There's just enough effort required of you from the start, and it is satisfying as those requirements become less and less.

Sonically, the sounds become lower and slower as the mouseover interaction progresses, which feels right. Additionally, there is a distortion *added*, and while this may initially feel like a weird decision, I think it works in a [Low "Hey What"](https://lowtheband.bandcamp.com/album/hey-what) kind of way (which, I feel is very soothing/reflective, but maybe not to all)

### Experiment 2 // 27 Jun, 2024

A white circle grows in...

https://mouseandthebillionaire.com/reflectiveStudies/02/

How did a week go by and I'm only *now* doing this? Focusing on reading? "Living" with the last prototype? Lazy? Either way, yeesh.

After trying the first version, LLB suggested moving from atonal/distortion to tonal/clean and we thought a simple flip of the black/white would mirror that change. As much as I hate to admit, I think it does work better? Even without changing the base audio, there is something about moving *out* of the distortion that communicates "improvement."  

Some ideas arise for a third iteration or for implementation in new prototypes:

- PJB suggested non black/white as more interesting, which is a good idea as it also gets us away from the good/bad language but I do kind of like the blank canvas aspects of B/W. 
- I'd like this to get a little more character at some point (hand-drawn, sketchy, tikatmos/lthc-vibe) but I don't want to get bogged down in needing to stylize the whole thing. Hopefully have this happen organically as the thing evolves. That being said, I think the first step might be to swap out this ugly start button...
- I don't mind sitting with this playing for a while, but I might have a higher tolerance to microchanges in music than the common listener, so it is probably a good idea to add a second (third? fourth? fifth?) stage of musical movement and/or slightly more interesting changes. However, the visuals don't do anything once the circle fils the screen, so maybe that doesn't make sense? But maybe they could?
- Adding on to this, I had it playing in the background as I was writing up the journal entry and at some point it refreshed to the start screen. I don't know if this was a p5 thing, or the localhost freaked out, but it brings up the problem of letting the thing grow and grow and grow which is unnecessary (and lazy) so should be addressed in any further iterations.
- For this version both the chimes and the chords are tuning as the interaction progresses, but it sound effective to have them retune at different speeds or have the chimes start in the root tone, causing them to move in out of phase/tune as the circle fills the screen.
- Side note: the number of times that I am typing too fast and swap the "ion" to "ino" in words (i.e distortion to distortino) is getting silly. The best way to acknowledge this fault in my typing skills is probably to have a project called something like EXPERIMENTINO)

### Thoughts on Future Possible Experiments // 17 Jul, 2024

- A version based on movement vs. no-movement where when you move there is chaos and when you don't it's in stasis. This "movement" could be with the mouse, arrow keys, an actual character in 2D/3D space? Chaos could be explosions of colors and shapes with stasis being simple repeated shapes (a la Bloom)
- Sonically, the chaos could be a constant cycling of possible note patterns in RNBO with stasis being a set pattern for some number of instruments. Or as you move it randomly plays pitches, but when you stop it settles on a specific pitch for each instrument. Or as you move it randomizes between voices, creating cacophony, but when you stop it chooses one. Or some combination of all of this.
- Reading Koike's [Practice of Not Thinking](relatedWork/#Koike, R. *The Practice of Not Thinking: A Guide to Mindful Living*), makes me think there could be some version of this that feels more game-like? It feels slightly wrong for "you sat still for a while, congrats the sounds have morphed into nature sounds," but still...? Similarly, we could bury sounds of nature underneath some other cacophony that aren't revealed programatically, but through active focusing by the player. Do you ask for this to happen ("Listen for the birds")? Or do you let it arise organically?
- A version where you bury the goal of standing still underneath some stated goal. "Collect all of the stars" but collecting the stars creates chaos and is sonically/visually disruptive
- Not that this fits as well into the "reflective state in games" mission, but a game where you have the option to put on headphones and listen to music while trying to do other things is pretty funny. You are given instructions to do some task but you missed it because your music was too loud and no one will repeat those instructions to you.
- A version where whoever is playing has to listen to a conversation my kids have with each other (which, for example, might contain them saying the word "fun" over and over and over and over as they read the Star Wars encyclopedia together, which is what they are doing as I am writing this)
- A version where the player's amount of "focus" changes the vocalized output of an NPC. 

### Experiment 03.00 // 18, Jul, 2024

For these next series of experiments, I would like to document a few possible version of the audio within Max/RNBO before integrating with p5. There are a lot of ideas here, and I think will be able to iterate faster if I don't have to worry about the p5 (or even visual) side of things.

![[03.00.png]]

All of these are based on the movement vs. no-movement outlined above, and the entire series will examine specific ideas and improvements within that concept. This first experiment lays down the framework upon which all the others will be built. Six different bell tones were exported out of Ableton Live, each starting on subsequent beats (1, 1.1.2, 1.1.3, etc). When the WASD keys are pressed ('cause it's a *gaaame*) the sounds are triggered, but as soon as all keys are released, the system selects a BPM between 40 and 175 and an interval for each of the 6 notes (8th, quarter, half, whole, double whole \[[breve!](https://en.wikipedia.org/wiki/Double_whole_note)\], and quadruple whole \[[longa!](https://en.wikipedia.org/wiki/Longa_(music))\])

[Experiment 03.00 on SoundCloud](https://soundcloud.com/thebillionaire/ex0300)

Even within this fairly simple system there are some really lovely patterns that get created. Still, some immediate ideas for improvement pop up:

- The tone of the sounds are weird. Something cleaner. Piano? Maybe even actual recorded piano? Higher pitch? More echoey?
- The 8th notes are too staccato here, but maybe that is fixed with a different instrument or narrowing down the breadth of possible overall tempos.
- An underlying looping pad sound could work well to tie everything together nicely
- Introducing additional variations of pitch changes could be fun. Easy enough to do by setting the rate of each groove~ object (as you can see I've already started doing above) These variations could be set during the randomization/movement phase, or could even be switched on and off during the no-movement sections to create more sonic interest'
- Likewise, slowly adding in a delay for as long as the keys aren't being pressed could reward continued non-movement
- Because the sounds are staggered, only the root C2 is getting triggered with the movement action. This is probably fine, but maybe it's worth recording these all out as a single file anyway and targeting their starting time in groove so we only have to load one file instead of 6? 
- If we do that, then maybe the starting time of each note could be randomized as well (start *after* a quarter-note, half-note, etc) Though right now there are some unexpected patterns happening and hopefully this wouldn't kill those serendipities. 
- It might also be good to have a sound effect that triggers during the 'movement.' Something to signify "chaos is happening! You're changing things!" Radio static? Jumping around between various sound effects? Both!? I really like the idea of the sound effect business. That might be job 1.