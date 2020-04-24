// amixer -D pulse sset Master 20%,50%
//
//
// awk -F"[][]" '/%/ { print $2 }' <(amixer -D pulse sget Master)
//
