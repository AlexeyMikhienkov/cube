import React, {useRef, useEffect} from "react";

let importPromise;

export default function Game() {
    const ref = useRef();

    useEffect(() => {
        importPromise.then(({game}) => {
            game.appendContainer(ref.current);
            game.init();
        });
    }, []);

    //TODO: удалять сцену после удаления компонента

    return (
        <div className={"game"}>
            <div className={"game__wrapper"} ref={ref}/>
        </div>
    )
}

export function setImportPromise(promise) {
    importPromise = promise;
}