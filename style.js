const larguraContainers = () => {
    if(window.innerWidth > window.innerHeight){
        document.body.style.width = '33%';
        document.body.style.marginLeft = '33%';
    } else{
        document.body.style.width = '100%';
        document.body.style.margin = '0';
    }
}

larguraContainers();