const larguraContainers = () => {
    if(window.innerWidth > window.innerHeight){
        document.body.classList.add('wide-layout');
        document.body.classList.remove('full-layout');
    } else{
        document.body.classList.remove('wide-layout');
        document.body.classList.add('full-layout');
    }
}

larguraContainers();
window.addEventListener('resize', larguraContainers);