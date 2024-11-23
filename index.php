<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Project</title>
    <?php include 'css/include_css.php'; ?>
</head>
<body>
    <?php include 'global/nav.php'; ?>

    <div class="container">
        <div class="text-wrapper grid-span-4">
            <h1 class="slide-in-left">*<i>Archit</i></h1>
            <h1 class="slide-in-right"><i>ecture</i>*</h1>
        </div>
    </div>

    <hr class="grid-span-4 grow-x">

    <div class="container">
        <div class="text-wrapper grid-span-2">
            <h2 class="slide-in-left">Brutalism</h2>
            <p class="fade-in">An architectural style that emerged prominently in the mid-20th century, Brutalism is defined by its bold, unapologetic embrace of raw materials, particularly exposed concrete, and its commitment to functionality over decorative elements. The term “Brutalism” derives from the French phrase béton brut, meaning “raw concrete,” which became a defining feature of the style. Brutalist structures are often characterized by their geometric, monolithic forms, emphasizing repetitive patterns and clean, angular lines. These buildings evoke a sense of starkness, strength, and permanence, often appearing monumental and imposing.

            The style gained traction in the post-war era as architects sought to create structures that were honest, utilitarian, and reflective of a new social order. It was especially suited to government buildings, universities, cultural institutions, and housing complexes, where its practical, low-maintenance qualities aligned with the economic constraints and social aspirations of the time.

            Despite its emphasis on functionality, Brutalism also embraced an artistic boldness. Architects used concrete not just structurally but also expressively, celebrating its textures, colors, and versatility. Some designs incorporated striking features such as cantilevered sections, bold overhangs, and dramatic voids, creating a sculptural presence in urban landscapes.

            However, the movement was polarizing. While admired for its raw honesty and futuristic ethos, Brutalist architecture was also criticized for being cold, harsh, and unwelcoming, with some detractors likening its structures to fortresses or bunkers. Over time, many Brutalist buildings faced neglect, demolition, or retrofitting, as public opinion shifted toward softer, more human-centric designs.

            Nevertheless, Brutalism remains an influential and enduring movement. It has experienced a resurgence of interest in recent years, with architects, historians, and enthusiasts celebrating its bold vision and its ability to evoke strong emotional responses. Today, Brutalism is appreciated not only for its functional and industrial qualities but also for its unique aesthetic contributions to modern architecture.</p>
        </div>

        <div class="image-wrapper slide-in-right grid-span-2 origin-right">
            <img class="right-side" src="img/unsplash1.jpg" alt="">
        </div>

        <hr class="grid-span-4 grow-x">

        <div class="wrapper grid-span-4">
            <div class="image-wrapper slide-in-left grid-span-2">
                <img class="left-side" src="img/unsplash2.jpg" alt="">
            </div>
            <div class="text-wrapper grid-span-1">
                <h2 class="slide-in-right">Skylines</h2>
                <p class="fade-in">Shaped by Brutalist structures often stand out for their bold, imposing presence and distinctive geometric forms. These buildings, with their raw concrete exteriors and monolithic designs, create a dramatic contrast against more traditional or modern glass-and-steel architecture. Brutalist structures contribute a sense of weight and permanence to cityscapes, often becoming iconic landmarks due to their unique aesthetic and scale. Despite their divisive reputation, these buildings leave a lasting imprint on skylines, reflecting the era's emphasis on functionality and resilience.</p>
            </div>
        </div>

        <hr class="grid-span-4 grow-x">

        <div class="wrapper grid-span-4">
            <div class="text-wrapper grid-span-1">
                <h2 class="slide-in-left">Modernism</h2>
                <p class="fade-in">Emerging in the early 20th century, modernist architecture is characterized by its emphasis on simplicity, functionality, and the use of new materials and technologies. This style often features clean lines, open spaces, and a lack of ornamentation, reflecting a break from traditional architectural forms. Modernist buildings prioritize the idea that form should follow function, resulting in designs that are both practical and aesthetically pleasing. The use of steel, glass, and reinforced concrete allows for innovative structural solutions and expansive windows, creating a sense of lightness and transparency. Modernism has significantly influenced contemporary architecture, promoting a forward-thinking approach to design that continues to evolve.</p>
            </div>
            <div class="image-wrapper slide-in-right grid-span-2 origin-right">
                <img class="right-side" src="img/unsplash3.jpg" alt="">
            </div>
        </div>

        <hr class="grid-span-4 grow-x">

        <div class="text-wrapper grid-span-3">
            <h2 class="slide-in-left">Heading 3</h2>
            <p class="fade-in">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quas laboriosam at cum quis aut dolores officiis fuga quibusdam, sunt provident laudantium tempora maiores. Iusto corrupti beatae molestias illum, eius minus.</p>
        </div>
    </div>

    <?php include 'global/footer.php'; ?>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const animatedElements = document.querySelectorAll('.fade-in, .slide-in-right, .slide-in-left, .zoom-in, .grow-x');

            // Create a new IntersectionObserver instance
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    // Check if the element is intersecting
                    if (entry.isIntersecting) {
                        // Add 'visible' class to the element
                        entry.target.classList.add('visible');
                        // Stop observing the element
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            // Observe each element with the animation classes
            animatedElements.forEach(element => {
                observer.observe(element);
            });
        });

        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) { // Change 100 to the desired scroll amount
                document.body.classList.add('scrolled');
            } else {
                document.body.classList.remove('scrolled');
            }
        });
    </script>
</body>
</html>