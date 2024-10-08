window.onload = function() {
    const canvas = document.getElementById('textCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Text settings
    let words = ["NEWEST", "BIGGER", "TEXT", "PACK"];
    const maxFontSize = 70; // Maximum font size
    const minFontSize = 0; // Initial font size
    const layerDepth = 0; // Number of layers for the 3D effect
    const perspectiveScale = 0.03; // Scale factor for perspective
    const lineHeight = 80; // No line height for close stacking
    const duration = 15; // Duration of the animation in frames
    const delay = 0; // Delay between each word's animation in frames (0.2s)
    const resizeDuration = 10; // Duration of the resizing animation in frames
    const delayBetweenResizes = 400; // 1-second delay between resizing words (in milliseconds)
    const moveDownDistance = 125; // Distance to move down after resizing
    const moveDownDuration = 10; // Duration of the move-down animation in frames

    let frame = 0; // Frame counter
    let animationComplete = false; // Flag to indicate if animation is complete

    // Rotate the canvas once at the beginning
    ctx.translate((canvas.width / 2) - lineHeight, (canvas.height / 2) - lineHeight);
    ctx.rotate(310 * Math.PI / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Function to draw 3D text with shadow
    function draw3DText(word, x, y, layerDepth, index, fontSize, offsetY = 0) {
        ctx.font = `${fontSize}px Arial Black`;

        for (let i = layerDepth; i > 0; i--) {
            const scale = 1 - (i * perspectiveScale);
            ctx.save();
            ctx.translate(x, y + index * lineHeight + offsetY);
            ctx.scale(scale, scale);
            ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + (0.8 * (i / layerDepth))})`;
            ctx.fillText(word, 1 * i, 1 * i); // Offset the layers slightly
            ctx.restore();
        }

        // Add shadow for the text
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.shadowBlur = 15;

        ctx.fillStyle = '#FFFFFF'; // Final layer in white
        ctx.fillText(word, x, y + index * lineHeight + offsetY);
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Calculate the total duration for the entire animation
        const totalAnimationDuration = words.length * duration;

        let allWordsLoaded = true; // Flag to track if all words are loaded

        // Loop through each word and draw it based on the current frame
        words.forEach((word, index) => {
            // Calculate the start frame for each word
            const startFrame = index * duration;
            // Calculate the end frame for each word
            const endFrame = startFrame + duration;

            if (frame >= startFrame && frame <= endFrame) {
                // Calculate animation progress for the current word
                const t = (frame - startFrame) / duration;
                const fontSize = minFontSize + t * (maxFontSize - minFontSize);
                draw3DText(word, canvas.width / 2, canvas.height / 2, layerDepth, index, fontSize);
                allWordsLoaded = false; // Not all words are loaded yet
            } else if (frame > endFrame) {
                // After the animation period for the word, draw it at the final size
                draw3DText(word, canvas.width / 2, canvas.height / 2, layerDepth, index, maxFontSize);
            }
        });

        // Increment frame counter and request next animation frame
        frame++;
        if (frame <= totalAnimationDuration) {
            requestAnimationFrame(animate);
        } else {
            if (!animationComplete) {
                // Trigger the callback to resize words from last to first
                setTimeout(() => {
                    resizeWordsFromLastToFirst();
                    animationComplete = true;
                }, 2000);
            }
        }
    }

    function resizeWordsFromLastToFirst() {
        let currentIndex = words.length - 1;

        function resizeNextWord() {
            if (currentIndex < 0) {
                console.log("All words resized to 0!");
                return;
            }

            let resizeFrame = 0;
            let moveDownFrame = 0;
            let initialOffsetY = 0;

            function animateResizeAndMoveDown() {
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

                words.forEach((word, i) => {
                    if (i < currentIndex) {
                        draw3DText(word, canvas.width / 2, canvas.height / 2, layerDepth, i, maxFontSize);
                    } else if (i === currentIndex) {
                        // Animate the font size from maxFontSize to 0 and move down simultaneously
                        const fontSize = maxFontSize - (resizeFrame / resizeDuration) * maxFontSize;
                        const moveDownOffset = (moveDownFrame / moveDownDuration) * moveDownDistance;
                        draw3DText(word, canvas.width / 2, canvas.height / 2, layerDepth, i, fontSize, moveDownOffset);
                    }
                });

                resizeFrame++;
                moveDownFrame++;
                if (resizeFrame <= resizeDuration || moveDownFrame <= moveDownDuration) {
                    requestAnimationFrame(animateResizeAndMoveDown);
                } else {
                    // Move to the next word after the current one has moved down
                    currentIndex--;
                    setTimeout(resizeNextWord, delayBetweenResizes);
                }
            }

            animateResizeAndMoveDown();
        }

        resizeNextWord();
    }

    animate();
};