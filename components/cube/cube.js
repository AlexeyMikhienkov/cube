import React, {useRef, useEffect} from "react";

let importPromise;

export default function Cube() {
    const ref = useRef();

    useEffect(() => {
        importPromise.then(({game}) => {
            game.appendContainer(ref.current);
            game.init();
        });
    }, []);

    //TODO: удалять сцену после удаления компонента

    return (
        <div className={"cube-wrapper"} ref={ref}/>
    )
}

export function setImportPromise(promise) {
    importPromise = promise;
}