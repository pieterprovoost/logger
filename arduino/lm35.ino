int pin = 0;

void setup() {
  analogReference(INTERNAL);
  Serial.begin(9600);
}

void loop() {
  float t = (1.1 * analogRead(pin) * 100.0) / 1024;
  Serial.println(t);
  delay(200);
}