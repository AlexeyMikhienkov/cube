import React, {useState, useEffect} from "react";
import Cube, {setImportPromise} from "../components/cube/cube";

export default function Home() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const promiseTHREE = import('../utils/three/three')
            .then(() => import('../components/cube/game'));
        setImportPromise(promiseTHREE);
        setLoaded(true)
    }, []);


    return (
        loaded ? <Cube /> : <p>Loading...</p>
    )
}

export async function getStaticProps() {
    return {
        props: {},
    };
}
