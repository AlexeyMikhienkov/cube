import React, {useRef, useEffect, useState} from "react";

let importPromise;

export default function Cube(initialState) {
    const ref = useRef();

    const [game, setGame] = useState(null);

    useEffect(() => {
        importGame().then(({game}) => {
            setGame(game);
            game.renderer = new THREE.WebGLRenderer({canvas: ref.current, antialias: true});
        })
    }, []);

    //TODO: удалять сцену после удаления компонента
    useEffect(() => {
        if (game)
            game.init();
    }, [game]);

    return (
        <div className={"cube-wrapper"}>
            <canvas className={"cube-wrapper__canvas"} ref={ref}/>
        </div>
    )
}

function importGame() {
    return importPromise;
}

export function setImportPromise(promise) {
    importPromise = promise;
}