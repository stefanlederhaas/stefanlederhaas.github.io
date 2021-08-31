gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray('.section').forEach(section => {
    ScrollTrigger.create({
        trigger:section,
        start: 'top top',
        pin: true,
        pinSpacing: false
    });
});

const proj1Div = document.getElementById('project1-div');
const proj1Img = document.getElementById('project1');
const start1 = proj1Img.src;
const hover1 = proj1Img.getAttribute('data-hover');

proj1Div.onmouseover = () => {proj1Img.src = hover1;}
proj1Div.onmouseout = () => {proj1Img.src = start1;}

function showAlert() {
    alert("Thank you for sending me a message.");
}