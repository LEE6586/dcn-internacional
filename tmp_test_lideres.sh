set -u
BASE=http://127.0.0.1:8090
rm -f /tmp/admin.cookies /tmp/lider.cookies
echo "== admin login =="
curl -s -c /tmp/admin.cookies -H 'Content-Type: application/json' -d '{"password":"testadmin123"}' "$BASE/api/admin/login"; echo
echo "== create leader =="
curl -s -b /tmp/admin.cookies -H 'Content-Type: application/json' -d '{"nombre":"Lider Prueba","email":"lider@example.com","telefono":"04140000000","usuario":"lider1","password":"clave12345","grupo":"jovenes"}' "$BASE/api/admin/lideres"; echo
echo "== list leaders =="
curl -s -b /tmp/admin.cookies "$BASE/api/admin/lideres"; echo
echo "== leader login =="
curl -s -c /tmp/lider.cookies -H 'Content-Type: application/json' -d '{"usuario":"lider1","password":"clave12345"}' "$BASE/api/lideres/login"; echo
echo "== leader me =="
curl -s -b /tmp/lider.cookies "$BASE/api/lideres/me"; echo
echo "== post cell =="
curl -s -b /tmp/lider.cookies -H 'Content-Type: application/json' -d '{"fecha":"2026-11-11","palabra":"La fe","personas":12,"notas":"Prueba"}' "$BASE/api/lideres/celulas"; echo
echo "== get cells =="
curl -s -b /tmp/lider.cookies "$BASE/api/lideres/celulas"; echo
echo "== admin cells =="
curl -s -b /tmp/admin.cookies "$BASE/api/admin/celulas?grupo=jovenes"; echo
echo "== reset link =="
LINK=$(curl -s -b /tmp/admin.cookies -X POST "$BASE/api/admin/lideres/1/reset-link" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')
echo "$LINK"
TOKEN=${LINK##*reset=}
echo "== reset password =="
curl -s -H 'Content-Type: application/json' -d "{\"token\":\"$TOKEN\",\"password\":\"nueva12345\"}" "$BASE/api/lideres/reset"; echo
echo "== login new password =="
curl -s -H 'Content-Type: application/json' -d '{"usuario":"lider1","password":"nueva12345"}' "$BASE/api/lideres/login"; echo
echo "== forgot =="
curl -s -H 'Content-Type: application/json' -d '{"email":"lider@example.com"}' "$BASE/api/lideres/forgot"; echo