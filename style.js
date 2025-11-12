const larguraContainers = () => {
    if (window.innerWidth > window.innerHeight) {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.width = '33%';
        document.body.style.border = '1px solid black';
        document.body.style.marginLeft = '33%';
    } else {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
    }
}

larguraContainers();
window.addEventListener('resize', larguraContainers);