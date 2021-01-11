import Location from './location';
import database from './utils/db';

const input: string[] = process.argv.slice(2);

function main() {
    if (input[0] == "location") {
        if (input[1] == "migrate") {
            const l = new Location();
            l.migrate();
        }
    }
}

database.connect(() => {
    main();
});
