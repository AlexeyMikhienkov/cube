import React, {useState, useEffect} from "react";
import Game, {setImportPromise} from "../components/game/game";

export default function Home() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const promiseTHREE = import('../utils/three/three')
            .then(() => import('../components/game/src/GameController'))
            .then((data) => {
                setLoaded(true);
                return data;
            });

        setImportPromise(promiseTHREE);
    }, []);

    return (
        loaded ? <Game/> : <p>Loading...</p>
    )
}

export async function getStaticProps() {
    return {
        props: {},
    };
}
